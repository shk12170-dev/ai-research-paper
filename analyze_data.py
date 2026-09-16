"""
과제 10 - 4단계: 결과 해석
raw_data.csv를 읽어 전체/프로젝트별 상관관계를 계산하고 산점도를 그린다.
"""
import csv
import math
import numpy as np
import matplotlib.pyplot as plt

plt.rcParams["font.family"] = "Malgun Gothic"
plt.rcParams["axes.unicode_minus"] = False

rows = list(csv.DictReader(open("raw_data.csv", encoding="utf-8")))
# avg_close_days가 빈 값인 행(그 달에 닫힌 이슈가 0건)은 상관관계 계산에서 제외
valid = [r for r in rows if r["avg_close_days"] != ""]

projects = sorted(set(r["project"] for r in rows))


def pearson(xs, ys):
    n = len(xs)
    mx, my = sum(xs) / n, sum(ys) / n
    cov = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    sx = math.sqrt(sum((x - mx) ** 2 for x in xs))
    sy = math.sqrt(sum((y - my) ** 2 for y in ys))
    if sx == 0 or sy == 0:
        return None
    r = cov / (sx * sy)
    # t 통계량으로 근사 p-value (양측검정)
    if n > 2 and abs(r) < 1:
        t = r * math.sqrt((n - 2) / (1 - r ** 2))
        # 정규분포 근사로 p-value 추정 (자유도가 충분히 크므로)
        from math import erf
        p = 2 * (1 - 0.5 * (1 + erf(abs(t) / math.sqrt(2))))
    else:
        p = None
    return r, p, n


print("=== 전체 (10개 프로젝트 x 12개월, n={}) ===".format(len(valid)))
xs = [float(r["active_contributors"]) for r in valid]
ys = [float(r["avg_close_days"]) for r in valid]
r, p, n = pearson(xs, ys)
print(f"Pearson r = {r:.3f}, p (근사) = {p:.4f}, n = {n}")

print("\n=== 프로젝트별 ===")
per_project = {}
for proj in projects:
    sub = [r for r in valid if r["project"] == proj]
    xs_p = [float(r["active_contributors"]) for r in sub]
    ys_p = [float(r["avg_close_days"]) for r in sub]
    if len(sub) >= 3:
        rp, pp, np_ = pearson(xs_p, ys_p)
        per_project[proj] = (rp, pp, np_)
        print(f"{proj:12s} r = {rp:+.3f}  p = {pp:.3f}  n = {np_}  "
              f"평균 기여자 {sum(xs_p)/len(xs_p):.1f}  평균 처리일 {sum(ys_p)/len(ys_p):.1f}")

# 산점도 (전체 + 프로젝트별 색 구분)
fig, ax = plt.subplots(figsize=(8, 6))
colors = plt.cm.tab10(np.linspace(0, 1, len(projects)))
for proj, color in zip(projects, colors):
    sub = [r for r in valid if r["project"] == proj]
    xs_p = [float(r["active_contributors"]) for r in sub]
    ys_p = [float(r["avg_close_days"]) for r in sub]
    ax.scatter(xs_p, ys_p, label=proj, color=color, alpha=0.7)

ax.set_xlabel("월별 활성 기여자 수 (active contributors)")
ax.set_ylabel("월별 이슈 평균 처리일 (avg close days)")
ax.set_title(f"CNCF 프로젝트: 기여자 수 vs 이슈 처리 시간 (전체 r={r:.3f})")
ax.legend(fontsize=8, loc="upper right")
fig.tight_layout()
fig.savefig("scatter_all.png", dpi=150)
print("\n저장됨: scatter_all.png")

# 결과 요약 CSV
with open("analysis_summary.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["project", "pearson_r", "p_value", "n", "mean_contributors", "mean_close_days"])
    w.writerow(["ALL", f"{r:.4f}", f"{p:.4f}", n,
                f"{sum(xs)/len(xs):.2f}", f"{sum(ys)/len(ys):.2f}"])
    for proj in projects:
        if proj in per_project:
            rp, pp, np_ = per_project[proj]
            sub = [row for row in valid if row["project"] == proj]
            mx = sum(float(row["active_contributors"]) for row in sub) / len(sub)
            my = sum(float(row["avg_close_days"]) for row in sub) / len(sub)
            w.writerow([proj, f"{rp:.4f}", f"{pp:.4f}", np_, f"{mx:.2f}", f"{my:.2f}"])
print("저장됨: analysis_summary.csv")
