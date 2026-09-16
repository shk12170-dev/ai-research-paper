"""
과제 10 - 데이터 수집 스크립트
CNCF 프로젝트별로 "월별 활성 기여자 수"와 "월별 이슈 평균 처리일(open->close)"을 GitHub REST API로 수집한다.

사용법:
    GITHUB_TOKEN=발급받은_토큰 python collect_data.py

- GITHUB_TOKEN: GitHub Personal Access Token (권한 범위 없이 발급 가능, 공개 저장소 조회만 사용)
  토큰 없이도 동작은 하지만 시간당 60회로 제한되어 전체 수집이 불가능하다.
- 중간에 rate limit(403/429)에 걸리면 자동으로 대기 후 재시도한다.
- raw_data.csv에 이미 있는 (프로젝트, 월) 조합은 건너뛰므로, 중단됐다가 다시 실행해도 이어서 수집된다.
"""
import os
import sys
import csv
import time
import datetime
import urllib.request
import urllib.error
import json

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
API_ROOT = "https://api.github.com"

# 후보 C: CNCF 프로젝트 10개 (각각 대표 저장소 1개, Graduated 프로젝트 위주로 규모 다양하게 선정)
PROJECTS = [
    ("Envoy", "envoyproxy/envoy"),
    ("Prometheus", "prometheus/prometheus"),
    ("containerd", "containerd/containerd"),
    ("etcd", "etcd-io/etcd"),
    ("Vitess", "vitessio/vitess"),
    ("CoreDNS", "coredns/coredns"),
    ("Helm", "helm/helm"),
    ("TiKV", "tikv/tikv"),
    ("Linkerd", "linkerd/linkerd2"),
    ("Rook", "rook/rook"),
]

# 관측 기간: 최근 12개월 (안내 3/5 - "최소 열 번 반복" 충족을 위해 프로젝트 x 월 단위로 관측치 확보)
def month_ranges(n_months=12):
    today = datetime.date.today().replace(day=1)
    ranges = []
    cursor = today
    for _ in range(n_months):
        # 이전 달로 이동
        prev_last_day = cursor - datetime.timedelta(days=1)
        start = prev_last_day.replace(day=1)
        end = prev_last_day
        ranges.append((start, end))
        cursor = start
    return list(reversed(ranges))


def api_get(url, headers, max_retries=8):
    """403/429(rate limit)를 만나면 건너뛰지 않고 대기 후 재시도한다."""
    for attempt in range(1, max_retries + 1):
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req) as resp:
                remaining = resp.headers.get("X-RateLimit-Remaining")
                data = json.loads(resp.read().decode())
                return data, remaining
        except urllib.error.HTTPError as e:
            if e.code not in (403, 429):
                raise
            retry_after = e.headers.get("Retry-After")
            reset_ts = e.headers.get("X-RateLimit-Reset")
            if retry_after:
                wait_s = int(retry_after) + 2
            elif reset_ts:
                wait_s = max(int(reset_ts) - int(time.time()), 0) + 5
            else:
                wait_s = min(60 * attempt, 300)
            print(f"  {e.code} 오류 (시도 {attempt}/{max_retries}), {wait_s}초 대기 후 재시도")
            time.sleep(wait_s)
    raise RuntimeError(f"재시도 {max_retries}회 초과: {url}")


def build_headers():
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "hw10-research-script"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"
    return headers


def count_active_contributors(repo, start, end, headers):
    """해당 월에 커밋을 남긴 고유 작성자 수"""
    authors = set()
    page = 1
    since = f"{start.isoformat()}T00:00:00Z"
    until_dt = end + datetime.timedelta(days=1)
    until = f"{until_dt.isoformat()}T00:00:00Z"
    while True:
        url = f"{API_ROOT}/repos/{repo}/commits?since={since}&until={until}&per_page=100&page={page}"
        data, remaining = api_get(url, headers)
        if not data:
            break
        for c in data:
            login = None
            if c.get("author"):
                login = c["author"].get("login")
            if not login:
                login = c.get("commit", {}).get("author", {}).get("email")
            if login:
                authors.add(login)
        time.sleep(1)
        if len(data) < 100:
            break
        page += 1
        if remaining is not None and int(remaining) < 3:
            print("  rate limit 임박, 60초 대기")
            time.sleep(60)
    return len(authors)


def avg_issue_close_days(repo, start, end, headers):
    """해당 월에 닫힌 이슈들의 open->close 평균 일수, 닫힌 이슈 수"""
    end_str = end.isoformat()
    start_str = start.isoformat()
    query = f"repo:{repo}+is:issue+is:closed+closed:{start_str}..{end_str}"
    page = 1
    durations = []
    total_count = None
    while True:
        url = f"{API_ROOT}/search/issues?q={query}&per_page=100&page={page}"
        data, remaining = api_get(url, headers)
        if total_count is None:
            total_count = data.get("total_count", 0)
        items = data.get("items", [])
        for it in items:
            created = datetime.datetime.strptime(it["created_at"], "%Y-%m-%dT%H:%M:%SZ")
            closed = datetime.datetime.strptime(it["closed_at"], "%Y-%m-%dT%H:%M:%SZ")
            durations.append((closed - created).total_seconds() / 86400)
        time.sleep(3)  # search API는 분당 요청 제한이 더 엄격함
        if len(items) < 100:
            break
        page += 1
        if remaining is not None and int(remaining) < 3:
            print("  search rate limit 임박, 60초 대기")
            time.sleep(60)
    avg_days = sum(durations) / len(durations) if durations else None
    return total_count or 0, avg_days


def load_done(out_path):
    """이미 성공적으로 수집된 (project, month_start) 조합을 읽어온다 (재개용)."""
    done = set()
    if os.path.exists(out_path):
        with open(out_path, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                done.add((row["project"], row["month_start"]))
    return done


def main():
    headers = build_headers()
    ranges = month_ranges(12)
    out_path = "raw_data.csv"
    done = load_done(out_path)
    if done:
        print(f"이미 수집된 {len(done)}개 구간은 건너뛰고 이어서 수집합니다.")
    file_exists = os.path.exists(out_path) and os.path.getsize(out_path) > 0
    with open(out_path, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow([
                "project", "repo", "month_start", "month_end",
                "active_contributors", "issues_closed_count", "avg_close_days",
            ])
        for name, repo in PROJECTS:
            for start, end in ranges:
                if (name, start.isoformat()) in done:
                    continue
                print(f"수집 중: {name} ({repo}) {start}~{end}")
                try:
                    contributors = count_active_contributors(repo, start, end, headers)
                    closed_count, avg_days = avg_issue_close_days(repo, start, end, headers)
                except Exception as e:
                    print(f"  건너뜀 (재시도 초과): {e}", file=sys.stderr)
                    continue
                writer.writerow([
                    name, repo, start.isoformat(), end.isoformat(),
                    contributors, closed_count,
                    f"{avg_days:.2f}" if avg_days is not None else "",
                ])
                f.flush()
                time.sleep(1)
    print(f"완료: {out_path}")


if __name__ == "__main__":
    main()
