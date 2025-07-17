export default function AboutPage() {
  return (
    <section className="mx-auto">
      {/* Education 타임라인 */}
      <h1 className="text-xl font-semibold mb-4">Education.</h1>
      <ol className="relative border-l-2 border-orange-200 pl-6 space-y-6 mb-14">
        {/* 1 */}
        <li className="flex gap-4 items-start">
          <span className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-orange-300" aria-hidden="true" />
          <div className="w-full bg-muted/30 dark:bg-muted/40 p-4 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">2022.03 - Now</div>
            <div className="text-sm font-semibold mb-1">한국외국어대학교 서울캠퍼스</div>
            <div className="text-xs text-muted-foreground">EICC(영어통번역) & 융복합소프트웨어 전공</div>
          </div>
        </li>
      </ol>
      {/* Experience 타임라인 */}
      <h1 className="text-xl font-semibold mb-4">Experience.</h1>
      <ol className="relative border-l-2 border-orange-200 pl-6 space-y-6 mb-14">
        {/* 1 */}
        <li className="flex gap-4 items-start">
          <span className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-orange-300" aria-hidden="true" />
          <div className="w-full bg-muted/30 dark:bg-muted/40 p-4 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">2024.07</div>
            <div className="text-sm font-semibold mb-1">XREAL XR Hackathon 우수상</div>
            <div className="text-xs text-muted-foreground">레시피 추천 VR 어시스턴트 | 클라이언트 개발</div>
          </div>
        </li>
        {/* 2 */}
        <li className="flex gap-4 items-start">
          <span className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-orange-300" aria-hidden="true" />
          <div className="w-full bg-muted/30 dark:bg-muted/40 p-4 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">2024.10</div>
            <div className="text-sm font-semibold mb-1">메타버스 개발자 경진대회 우수상</div>
            <div className="text-xs text-muted-foreground">APOC을 활용한 KBO 구단 브랜딩 XR 웹 서비스 | 총괄_기획, 개발, 디자인(UI/UX) 담당</div>
          </div>
        </li>
        {/* 3 */}
        <li className="flex gap-4 items-start">
          <span className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-orange-300" aria-hidden="true" />
          <div className="w-full bg-muted/30 dark:bg-muted/40 p-4 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">2024.12</div>
            <div className="text-sm font-semibold mb-1">XR 디바이스 콘텐츠 메이커톤 <span className="ml-1">| 본선 진출</span></div>
            <div className="text-xs text-muted-foreground">Open AI와 yolo v11을 활용한 AR 인공지능 요리 어시스턴트 | 클라이언트 개발</div>
          </div>
        </li>
      </ol>
      {/* Certification 타임라인 */}
      <h2 className="text-xl font-semibold mb-4">Certification.</h2>
      <ol className="relative border-l-2 border-orange-200 pl-6 space-y-6">
        <li className="flex gap-4 items-start">
          <span className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-orange-300" aria-hidden="true" />
          <div className="w-full bg-muted/30 dark:bg-muted/40 p-4 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">2025.06</div>
            <div className="text-sm font-semibold mb-1">GTQ-i 1급</div>
            <div className="text-xs text-muted-foreground">그래픽기술자격 GTQ-i 1급(한국생산성본부)</div>
          </div>
        </li>
        <li className="flex gap-4 items-start">
          <span className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-orange-300" aria-hidden="true" />
          <div className="w-full bg-muted/30 dark:bg-muted/40 p-4 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">2025.06</div>
            <div className="text-sm font-semibold mb-1">SQLD</div>
            <div className="text-xs text-muted-foreground">SQL 개발자(한국데이터산업진흥원)</div>
          </div>
        </li>
        <li className="flex gap-4 items-start">
          <span className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-orange-300" aria-hidden="true" />
          <div className="w-full bg-muted/30 dark:bg-muted/40 p-4 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">2025.08</div>
            <div className="text-sm font-semibold mb-1">GTQ 1급</div>
            <div className="text-xs text-muted-foreground">그래픽기술자격 1급(한국생산성본부)</div>
          </div>
        </li>
        <li className="flex gap-4 items-start">
          <span className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-orange-300" aria-hidden="true" />
          <div className="w-full bg-muted/30 dark:bg-muted/40 p-4 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">2025.09</div>
            <div className="text-sm font-semibold mb-1">ADsP</div>
            <div className="text-xs text-muted-foreground">데이터분석 준전문가(한국데이터산업진흥원)</div>
          </div>
        </li>
      </ol>
    </section>
  );
}
