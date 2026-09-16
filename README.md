# 재현 패키지 안내

## 파일 구성
- `논문.docx` — 완성 논문 (표지, 초록, 서론-방법-결과-논의, 참고문헌, 재현 방법)
- `raw_data.csv` — 원자료 (CNCF 10개 프로젝트 x 12개월, 120행)
- `collect_data.py` — 원자료 수집 스크립트 (GitHub REST API)
- `analyze_data.py` — 분석 스크립트 (상관분석 + 산점도 생성)
- `analysis_summary.csv` — 프로젝트별 상관계수·p-value 요약
- `scatter_all.png` — 논문 그림 1 (산점도)
- `AI와_나의_판단.md` — AI에게 맡긴 일과 직접 판단한 일 구분

## 원자료를 다시 수집하려면
1. GitHub 계정에서 Personal Access Token 발급 (권한 범위 없이, 공개 데이터 읽기 전용)
2. 이 폴더에서 실행:
   ```bash
   GITHUB_TOKEN=발급받은_토큰 python collect_data.py
   ```
   (Windows PowerShell: `$env:GITHUB_TOKEN="토큰"; python collect_data.py`)
3. 완료되면 `raw_data.csv`가 갱신됨 (이미 수집된 프로젝트·월은 건너뛰고 이어서 수집하는 재개 기능 포함)

## 분석 표·그림을 다시 만들려면
```bash
pip install matplotlib numpy
python analyze_data.py
```
`analysis_summary.csv`와 `scatter_all.png`가 재생성된다.

## 데이터 수집 시점
2026년 9월 15일~16일, GitHub REST API(api.github.com)를 통해 수집. 같은 쿼리라도 이후 재수집 시 이슈 상태·커밋 이력이 달라져 값이 달라질 수 있음.
