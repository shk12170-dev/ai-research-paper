const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  ImageRun, PageBreak, VerticalAlign,
} = require("docx");

const WORKDIR = "C:\\Users\\상해기\\OneDrive\\바탕 화면\\과제 10 AI와 함께 쓰는 첫 논문";
const imgBuf = fs.readFileSync(`${WORKDIR}\\scatter_all.png`);

function h1(text) {
  return new Paragraph({
    text, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 },
    keepNext: true, keepLines: true,
  });
}
function h2(text) {
  return new Paragraph({
    text, heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 150 },
    keepNext: true, keepLines: true,
  });
}
function p(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, ...opts })], spacing: { after: 160 }, alignment: opts.align,
    keepLines: true,
  });
}
function bullet(text) {
  return new Paragraph({ text, bullet: { level: 0 }, spacing: { after: 100 }, keepLines: true });
}

function cell(text, { header = false, width } = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: header ? { type: ShadingType.CLEAR, fill: "D9D9D9" } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      children: [new TextRun({ text: String(text), bold: header, size: 20 })],
      alignment: AlignmentType.CENTER,
    })],
  });
}

const resultRows = [
  ["프로젝트", "Pearson r", "p-value", "n", "평균 기여자 수", "평균 처리일"],
  ["전체(pooled)", "-0.041", "0.661", "119", "23.9", "206.3"],
  ["CoreDNS", "+0.761", "0.000", "11", "12.4", "279.8"],
  ["etcd", "+0.495", "0.072", "12", "17.6", "291.8"],
  ["TiKV", "+0.485", "0.080", "12", "12.7", "67.9"],
  ["Prometheus", "+0.234", "0.447", "12", "39.8", "292.7"],
  ["Rook", "+0.088", "0.780", "12", "17.7", "124.4"],
  ["Envoy", "+0.024", "0.940", "12", "68.5", "113.5"],
  ["Linkerd", "-0.008", "0.979", "12", "8.1", "244.9"],
  ["containerd", "-0.160", "0.609", "12", "25.9", "255.6"],
  ["Helm", "-0.213", "0.491", "12", "18.2", "254.7"],
  ["Vitess", "-0.254", "0.406", "12", "16.9", "143.4"],
];
const colWidths = [1600, 1300, 1300, 700, 1600, 1600];
const table = new Table({
  columnWidths: colWidths,
  width: { size: colWidths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
  rows: resultRows.map((r, i) => new TableRow({
    children: r.map((v, j) => cell(v, { header: i === 0, width: colWidths[j] })),
  })),
});

const refRows = [
  "Nguyen Duc, A., Cruzes, D. S., Ayala, C., & Conradi, R. (2011). Impact of Stakeholder Type and Collaboration on Issue Resolution Time in OSS Projects. In Open Source Systems: Grounding Research (OSS 2011), IFIP AICT 365. Springer. https://doi.org/10.1007/978-3-642-24418-6_1",
  "Ajibode, A., et al. (2023). Software issues report for bug fixing process: An empirical study of machine-learning libraries. arXiv:2312.06005. https://arxiv.org/abs/2312.06005",
  "Eiroa-Lledo, C., Ali, S., Pinto, R., Anderson, E., & Linstead, E. (2023). Large-Scale Identification and Analysis of Factors Impacting Simple Bug Resolution Times in Open Source Software Repositories. Applied Sciences, 13(5), 3150. https://doi.org/10.3390/app13053150",
  "Sülün, E., et al. (2024). An Empirical Analysis of Issue Templates Usage in Large-Scale Projects on GitHub. ACM Transactions on Software Engineering and Methodology. https://doi.org/10.1145/3643673",
];

const doc = new Document({
  sections: [
    // 표지
    {
      properties: { page: { size: { width: 12240, height: 15840 } } },
      children: [
        new Paragraph({ text: "", spacing: { before: 3000 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "클라우드 네이티브 오픈소스 프로젝트에서", bold: true, size: 32 })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [new TextRun({ text: "활성 기여자 수와 이슈 처리 시간의 관계", bold: true, size: 32 })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 800 },
          children: [new TextRun({ text: "— CNCF 10개 프로젝트 분석 —", size: 24, color: "555555" })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 1600 },
          children: [new TextRun({ text: "과제 10. AI와 함께 쓰는 첫 논문 — 가설에서 결론까지", size: 20, color: "777777" })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 1200 },
          children: [new TextRun({ text: "작성자: 김상혁", size: 22 })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "작성일: 2026-09-16", size: 22 })],
        }),
        new Paragraph({ children: [new PageBreak()] }),
      ],
    },
    // 본문
    {
      properties: { page: { size: { width: 12240, height: 15840 } } },
      children: [
        h1("초록"),
        p("오픈소스 소프트웨어 운영에서는 \u201c기여자가 많을수록 이슈나 버그가 더 빨리 해결된다\u201d는 통념이 널리 퍼져 있다. 본 연구는 이 통념을 CNCF(Cloud Native Computing Foundation) 소속 클라우드 네이티브 프로젝트 10개(Envoy, Prometheus, containerd, etcd, Vitess, CoreDNS, Helm, TiKV, Linkerd, Rook)를 대상으로 실증적으로 검증했다. GitHub REST API를 통해 각 프로젝트의 최근 12개월간 월별 활성 기여자 수와 이슈 평균 처리 시간을 수집했으며(n=120, 결측 1건 제외 시 119건), 피어슨 상관분석과 세 가지 강건성 검증(로그 변환, 이상치 제외, 프로젝트 단위 집계)을 수행했다. 분석 결과 전체 표본에서는 유의한 상관관계가 나타나지 않았고(r=-0.041, p=0.661), 기여자 수가 유독 많은 Envoy를 제외하면 오히려 기여자 수가 많을수록 처리 시간이 길어지는 유의한 양의 상관(r=0.226, p=0.017)이 확인되었다. 이는 \u201c기여자가 많을수록 처리가 빨라진다\u201d는 원래 가설과 반대되는 결과로, 조율 비용 증가 등 대안적 설명이 필요함을 시사한다."),

        h1("1. 서론"),
        p("오픈소스 소프트웨어 커뮤니티에는 \u201c눈이 충분히 많으면 버그는 얕아진다(Linus's Law)\u201d는 유명한 격언이 있다. 이 격언은 기여자·리뷰어 수가 많을수록 문제 발견과 해결이 빨라진다는 믿음으로 이어져, 실무에서는 종종 기여자 수나 스타 수를 프로젝트 \u201c건강성\u201d의 대리 지표로 사용한다. 그러나 이 관계가 실제 데이터로 얼마나 뒷받침되는지는 프로젝트마다 다르게 보고되어 왔다."),
        p("선행 연구를 보면, Nguyen Duc 외(2011)는 이해관계자 유형과 협업 정도가 OSS 이슈 처리 시간에 영향을 준다는 직접적 근거를 제시했다. 반면 Ajibode 외(2023)는 6개 머신러닝 라이브러리 중 단 1개(Keras)에서만 기여자 수와 이슈 처리 기간 사이 상관관계를 발견했고, 나머지 4개에서는 뚜렷한 관계가 없었다. Eiroa-Lledo 외(2023)는 프로젝트 규모·성숙도 같은 프로젝트 특성이 버그 해결 시간에 영향을 준다는 일반적 근거를 제공했으며, Sülün 외(2024)는 이슈 템플릿 같은 운영 관행만으로도 해결 시간이 크게(381일→103일) 달라질 수 있음을 보여, 기여자 수 외의 교란 변수가 존재함을 경고했다."),
        p("이러한 선행 연구들은 대부분 개별 언어 생태계(머신러닝 라이브러리 등)나 일반 오픈소스 저장소를 대상으로 했으며, 클라우드 네이티브 인프라를 다루는 CNCF 생태계에 한정해 \u201c기여자 수 \u2192 이슈 처리 속도\u201d 관계를 검증한 연구는 확인되지 않았다. CNCF는 DevStats라는 공개 데이터 포털을 공식 운영하며 기여자·이슈 지표를 투명하게 공개하고 있어, 이 생태계를 대상으로 한 검증은 실행 가능하면서도 기존 연구의 공백을 채울 수 있는 주제다."),
        p("이에 본 연구는 다음 가설을 세우고 검증한다: \u201cCNCF 오픈소스 프로젝트는 활성 기여자 수가 많을수록, 이슈가 열린 시점부터 닫히는 시점까지 걸리는 평균 처리 시간이 짧다.\u201d"),

        h1("2. 방법"),
        h2("2.1 분석 대상"),
        p("CNCF Graduated 등급 프로젝트 중, Kubernetes처럼 여러 저장소·SIG(Special Interest Group) 구조로 나뉘어 있어 집계가 복잡한 경우를 제외하고, 단일 대표 저장소를 가진 프로젝트 10개를 규모가 다양하도록 선정했다: Envoy, Prometheus, containerd, etcd, Vitess, CoreDNS, Helm, TiKV, Linkerd, Rook."),
        h2("2.2 변수 정의 및 데이터 출처"),
        bullet("활성 기여자 수: 해당 월에 최소 1회 이상 커밋을 남긴 고유 작성자 수 (GitHub REST API의 저장소 커밋 목록에서 산출)"),
        bullet("이슈 평균 처리 시간: 해당 월에 닫힌 이슈들의 (닫힌 시각 \u2212 생성 시각)을 일 단위로 환산한 값의 평균 (GitHub Search Issues API 사용)"),
        bullet("관측 기간: 2025-09 \u2013 2026-08 (최근 12개월)"),
        bullet("데이터 출처: GitHub REST API(api.github.com), 공개 API. 2026년 9월 15일~16일에 실제로 호출하여 수집함"),
        p("데이터는 자체 작성한 Python 스크립트(collect_data.py)로 자동 수집했으며, GitHub API의 속도 제한(rate limit)에 대응하기 위해 재시도·백오프·재개(resume) 로직을 포함했다. 최종 표본 크기는 10개 프로젝트 \u00d7 12개월 = 120개 관측치이며, 이 중 1개(CoreDNS, 2026년 2월)는 해당 월에 닫힌 이슈가 0건이어서 평균 처리 시간을 계산할 수 없어 상관분석에서 제외했다(유효 n=119)."),
        h2("2.3 분석 방법"),
        p("활성 기여자 수와 이슈 평균 처리 시간 간의 관계를 피어슨 상관계수(r)로 측정하고, t-근사를 통해 유의확률(p-value)을 계산했다. 원가설이 지지되지 않을 가능성에 대비해, 세 가지 강건성 검증을 추가로 수행했다: (1) 기여자 수가 오른쪽으로 치우친 분포이므로 로그 변환 후 재계산, (2) 기여자 수가 유독 큰 이상치인 Envoy(월 50\u201397명)를 제외한 재계산, (3) 12개월치를 프로젝트별 평균으로 집계한 10개 관측치로 재계산."),

        p("가설 기각 기준(사전 설정): 상관계수가 유의수준 0.05에서 통계적으로 유의하지 않거나(p≥0.05), 부호가 가설이 예측한 음(-)의 방향이 아닌 경우 원 가설은 기각된 것으로 판단하기로 사전에 정했다."),
        p("전체 수집에 앞서, 비인증 상태로 CoreDNS 저장소 2025년 1월 한 달치만으로 스크립트 로직을 시험 실행하여 활성 기여자 수(1명), 닫힌 이슈 수(5건), 평균 처리 시간(20.57일)이 정상적으로 산출되는지 확인한 뒤 전체 수집을 진행했다."),
        h2("2.4 바꾼 조건과 고정한 조건"),
        bullet("바꾼 조건 1: 프로젝트 (10개)"),
        bullet("바꾼 조건 2: 관측 월 (12개월)"),
        bullet("고정한 조건: 활성 기여자·이슈 처리 시간의 조작적 정의, 데이터 출처(GitHub REST API), 관측 기간의 길이(12개월)"),

        h1("3. 결과"),
        p("표 1은 전체 및 프로젝트별 상관분석 결과를 보여준다."),
        table,
        new Paragraph({ text: "", spacing: { after: 200 } }),
        p("전체 표본(n=119)에서는 통계적으로 유의한 상관관계가 나타나지 않았다(r=-0.041, p=0.661). 프로젝트별로 보면 4개 프로젝트(Vitess, Helm, containerd, Linkerd)는 가설이 예측한 음의 상관 방향을 보였으나 모두 유의하지 않았다(p>0.4). 반대로 6개 프로젝트(CoreDNS, etcd, TiKV, Prometheus, Rook, Envoy)는 양의 상관, 즉 가설과 반대 방향을 보였고, 이 중 CoreDNS는 매우 강하고 뚜렷하게 유의했다(r=+0.761, p<0.001). etcd(r=+0.495, p=0.072)와 TiKV(r=+0.485, p=0.080)도 유의 수준(0.05)에 근접한 양의 상관을 보였다."),
        p("그림 1은 전체 관측치의 산점도로, x축은 월별 활성 기여자 수, y축은 월별 이슈 평균 처리일이다."),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 100 },
          keepNext: true,
          children: [new ImageRun({ data: imgBuf, type: "png", transformation: { width: 480, height: 360 } })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
          keepLines: true,
          children: [new TextRun({ text: "그림 1. CNCF 프로젝트별 활성 기여자 수와 이슈 평균 처리 시간의 관계", italics: true, size: 18 })],
        }),
        p("강건성 검증 결과는 다음과 같다:"),
        bullet("로그 변환: r=0.026, p=0.780 \u2192 여전히 관계 없음"),
        bullet("Envoy 제외 재계산: r=+0.226, p=0.017 \u2192 유의한 양의 상관(가설과 반대 방향)으로 전환"),
        bullet("프로젝트별 평균 집계(n=10): r=-0.178, p=0.610 \u2192 방향은 가설과 같으나 표본 부족으로 유의하지 않음"),

        h1("4. 논의"),
        h2("4.1 가설 검증 결과"),
        p("본 연구의 가설, \u201c활성 기여자 수가 많을수록 이슈 평균 처리 시간이 짧다\u201d는 수집한 CNCF 10개 프로젝트 표본에서 지지되지 않았다. 오히려 극단값(Envoy)을 제외하면 통계적으로 유의한 반대 방향의 관계가 나타났으며, 개별 프로젝트 중에서도 유일하게 강하게 유의했던 CoreDNS 역시 반대 방향이었다. 따라서 가설을 데이터에 맞춰 수정하지 않고, 원래 문장 그대로 기각(reject)하는 것이 타당하다고 판단했다."),
        h2("4.2 반대 방향으로 나타난 이유에 대한 대안 설명"),
        p("결과를 억지로 가설에 끼워 맞추기보다, 선행 연구에 근거한 대안 설명을 검토했다. 첫째, Sülün 외(2024)가 보인 것처럼 이슈 템플릿·트리아지 체계 같은 운영 관행 차이가 처리 시간을 크게 좌우할 수 있는데, 본 연구는 이 변수를 통제하지 못했다. 기여자가 늘어난 만큼 조율 비용(coordination overhead)이 함께 늘어 처리가 오히려 늦어졌을 가능성이 있다. 둘째, Eiroa-Lledo 외(2023)가 지적한 프로젝트 규모·이슈 복잡도 차이도 원인이 될 수 있다. Envoy처럼 기여자 수 자체가 매우 큰 프로젝트는 기업 소속 상근 인력의 비중이 높아 \u201c기여자 수\u201d가 갖는 의미가 자원봉사자 중심 프로젝트와 다를 수 있다. 셋째, Ajibode 외(2023)가 6개 라이브러리 중 1개에서만 상관관계를 발견했듯, 이번 결과도 10개 중 1개(CoreDNS)만 강하게 유의했다는 점에서 \u201c기여자 수 하나로 설명되는 보편 법칙은 없다\u201d는 선행 연구의 결론과 일치한다. 넷째, 본 연구가 \u201c활성 기여자 수\u201d를 커밋 작성자 수로 근사한 방법론적 한계도 있다. 봇 계정이나 일회성 기여자가 섞여 실제 \u201c이슈 대응 인력\u201d과 괴리가 있을 수 있다."),
        h2("4.3 한계"),
        bullet("관측 대상이 CNCF 소속 10개 프로젝트, 12개월로 제한되어 CNCF 전체나 오픈소스 전반으로 일반화할 수 없다."),
        bullet("\u201c활성 기여자 수\u201d를 커밋 작성자 수로 근사했으며, 봇 계정·1회성 기여를 구분하지 않았다."),
        bullet("\u201c닫힌 이슈\u201d에는 실제로 해결된 것과 답 없이 종료(stale/wontfix)된 것이 섞여 있어, 처리 시간이 곧 해결 품질을 의미하지 않는다."),
        bullet("상관관계 분석이므로 인과관계를 주장할 수 없다. 기여자 수 증가가 처리 지연의 원인인지, 이슈가 많아져서 기여자가 몰린 결과(역인과)인지는 이번 데이터로 구분할 수 없다."),
        h2("4.4 결론"),
        p("이번에 수집한 CNCF 10개 프로젝트·12개월 데이터(n=119)에서는 활성 기여자 수와 이슈 평균 처리 시간 사이에 유의미한 음의 상관관계가 나타나지 않았다(r=-0.041, p=0.661). 오히려 CoreDNS(r=+0.761, p<0.001)처럼 기여자가 많을수록 처리 시간이 길어지는 강한 반대 방향의 사례가 있었고, 이상치인 Envoy를 제외하고 재계산하면 전체적으로도 유의한 양의 상관(r=+0.226, p=0.017)이 나타났다. 따라서 \u201c기여자 수가 많을수록 이슈 처리가 빨라진다\u201d는 원래 가설은 이 표본에서는 기각되며, 오히려 일부 프로젝트에서는 기여자 증가가 조율 비용 증가로 이어져 처리를 늦출 수 있다는 정반대의 가능성이 시사된다. 이 결론은 이번에 수집한 10개 CNCF 프로젝트·최근 12개월 데이터에 한정되며, 오픈소스 전반에 대한 일반화 주장은 아니다."),

        h1("참고문헌"),
        ...refRows.map((r) => new Paragraph({
          text: r,
          spacing: { after: 200 },
          indent: { left: 480, hanging: 480 },
          keepLines: true,
        })),

        h1("재현 방법"),
        p("원자료(raw_data.csv), 수집 스크립트(collect_data.py), 분석 스크립트(analyze_data.py), 산점도(scatter_all.png), 요약 통계(analysis_summary.csv)는 재현 패키지 ZIP에 함께 포함되어 있다. GitHub Personal Access Token을 환경변수로 설정한 뒤 \u201cpython collect_data.py\u201d로 원자료를 재수집할 수 있으며, \u201cpython analyze_data.py\u201d로 표와 그림을 재생성할 수 있다. 자세한 실행 절차는 재현 패키지 내 README.md를 참고한다."),

        h1("부록 A. 연구 설계 및 진행 과정"),
        h2("A.1 관심 분야와 후보 주제"),
        p("관심 분야는 네트워크 보안, 프론트엔드/백엔드 개발, 클라우드 엔지니어링이었다. 이 안에서 AI와 함께 공개 데이터로 검증 가능한 후보 주제 10개를 브레인스토밍한 뒤, 다음 3개를 최종 후보로 좁혔다."),
        bullet("후보 A: 오픈소스 인기도(스타 수)가 취약점 대응 속도(패치 기간)에 영향을 준다 — GitHub Advisory DB 기반"),
        bullet("후보 B: 네트워크 트래픽 특성이 공격 트래픽 분류와 관련 있다 — CICIDS2017/NSL-KDD 기반"),
        bullet("후보 C(채택): CNCF 오픈소스 프로젝트의 활성 기여자 수가 이슈 처리 속도에 영향을 준다 — CNCF DevStats/GitHub API 기반"),
        h2("A.2 후보를 접은 이유와 최종 선택 이유"),
        p("후보 A는 GitHub Advisory DB와 저장소 메타데이터를 직접 매칭해야 해서 데이터 정제 작업량이 가장 크고, 정해진 시간 내 완주 위험이 있어 접었다. 후보 B는 데이터가 이미 라벨링되어 있어 실행은 쉬웠지만, 가설을 새로 검증한다기보다 이미 잘 알려진 표준 분류 문제에 가까워 참신성이 낮다고 판단해 접었다. 후보 C는 클라우드 엔지니어링 관심 분야를 직접 반영하면서도, CNCF가 공식 운영하는 DevStats라는 목적에 맞는 공개 데이터 포털이 있어 데이터 신뢰도가 가장 높다고 판단해 최종 채택했다."),
        h2("A.3 AI와 가설을 다듬은 과정"),
        p("① 관심 분야 제시 → ② AI가 공개 데이터 기반 후보 10개 제안 → ③ 그중 2개를 직접 지목하고 클라우드 주제 1개를 추가 요청 → ④ AI가 CNCF DevStats 기반 주제(후보 C)를 제안 → ⑤ 세 후보를 가설 문장·측정 방법·반증 조건까지 구체화한 뒤 후보 C를 최종 가설로 확정하는 순서로 진행했다."),
        h2("A.4 데이터 수집 방식을 도중에 바꾼 이유"),
        p("원래 계획은 CNCF DevStats 대시보드에서 프로젝트별로 지표를 수동으로 내려받는 것이었다. 그러나 10개 프로젝트 × 12개월 × 지표 2종이면 100회가 넘는 수작업이 필요해 정해진 시간 내 완주가 어렵다고 판단해, 동일한 두 지표(활성 기여자 수, 이슈 처리 시간)를 GitHub REST API로 자동 수집하는 스크립트 방식으로 변경했다. DevStats에서 확인한 “이 지표가 실제로 존재하고 의미 있다”는 사실은 그대로 유지하되, 수집 경로만 재현 가능한 스크립트로 바꾼 것이다."),
        h2("A.5 참고문헌 출처를 확인한 방법"),
        p("웹 검색으로 각 논문 제목을 검색해 학술 출판사(Springer, MDPI, ACM) 또는 arXiv의 원문 페이지·DOI가 실제로 존재함을 확인했으며, 4개 URL 모두 로그인·계정 생성 없이 새 창에서 열리는 것을 확인했다."),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(`${WORKDIR}\\논문.docx`, buf);
  console.log("done");
});
