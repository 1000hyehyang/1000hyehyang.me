import Image from "next/image";

export default function AboutPage() {
  return (
    <section className="mx-auto">
      {/* Education 타임라인 */}
      <h1 className="text-xl font-semibold mb-4">Education.</h1>
      <ol className="relative border-l-2 border-orange-200 pl-6 space-y-6 mb-14">
        {/* 1 */}
        <li className="flex gap-4 items-start">
          <span className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-orange-300" aria-hidden="true" />
          <div className="w-full bg-muted/25 dark:bg-muted/40 p-4 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">2022.03 - Now</div>
            <div className="flex items-center gap-2 mb-1">
              <Image
                src="/college.png"
                alt="HUFS 로고"
                width={24}
                height={24}
                className="rounded-xs"
                aria-hidden="true"
              />
              <span className="text-sm font-semibold">한국외국어대학교 서울캠퍼스</span>
            </div>
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
          <div className="w-full bg-muted/25 dark:bg-muted/40 p-4 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">2024.03 - 2025.02</div>
            <div className="flex items-center gap-2 mb-1">
              <Image
                src="/xreal.png"
                alt="XREAL 로고"
                width={24}
                height={24}
                className="rounded-xs"
                aria-hidden="true"
              />
              <span className="text-sm font-semibold">XREAL 6th Dev</span>
            </div>
            <div className="text-xs text-muted-foreground">Unity를 활용한 XR 콘텐츠 개발</div>
          </div>
        </li>
        {/* 2 */}
        <li className="flex gap-4 items-start">
          <span className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-orange-300" aria-hidden="true" />
          <div className="w-full bg-muted/25 dark:bg-muted/40 p-4 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">2024.10 - Now</div>
            <div className="flex items-center gap-2 mb-1">
              <Image
                src="/umc.png"
                alt="UMC 로고"
                width={24}
                height={24}
                className="rounded-xs"
                aria-hidden="true"
              />
              <span className="text-sm font-semibold">UMC 7th Design</span>
            </div>
            <div className="text-xs text-muted-foreground">IT 연합 동아리 UMC 디자인 파트장</div>
          </div>
        </li>
        {/* 3 */}
        <li className="flex gap-4 items-start">
          <span className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-orange-300" aria-hidden="true" />
          <div className="w-full bg-muted/25 dark:bg-muted/40 p-4 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">2024.12</div>
            <div className="flex items-center gap-2 mb-1">
              <Image
                src="/xreal.png"
                alt="XRREAL 로고"
                width={24}
                height={24}
                className="rounded-xs"
                aria-hidden="true"
              />
              <span className="text-sm font-semibold">XR 디바이스 콘텐츠 메이커톤 <span className="ml-1">| 본선 진출</span></span>
            </div>
            <div className="text-xs text-muted-foreground">Open AI와 yolo v11을 활용한 AR 인공지능 요리 어시스턴트 | 클라이언트 개발</div>
          </div>
        </li>
        {/* 4 */}
        <li className="flex gap-4 items-start">
          <span className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-orange-300" aria-hidden="true" />
          <div className="w-full bg-muted/25 dark:bg-muted/40 p-4 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">2025.01 - 2025.07</div>
            <div className="flex items-center gap-2 mb-1">
              <Image
                src="/programmers.jfif"
                alt="프로그래머스 로고"
                width={24}
                height={24}
                className="rounded-xs"
                aria-hidden="true"
              />
              <span className="text-sm font-semibold">프로그래머스 생성형 AI 활용 백엔드 데브코스 1기</span>
            </div>
            <div className="text-xs text-muted-foreground">생성형 AI를 활용한 Spring Boot 백엔드 개발</div>
          </div>
        </li>
      </ol>
      {/* Awards 타임라인 */}
      <h1 className="text-xl font-semibold mb-4">Awards.</h1>
      <ol className="relative border-l-2 border-orange-200 pl-6 space-y-6 mb-14">
        {/* 1 */}
        <li className="flex gap-4 items-start">
          <span className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-orange-300" aria-hidden="true" />
          <div className="w-full bg-muted/25 dark:bg-muted/40 p-4 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">2024.07</div>
            <div className="flex items-center gap-2 mb-1">
              <Image
                src="/xreal.png"
                alt="XREAL 로고"
                width={24}
                height={24}
                className="rounded-xs"
                aria-hidden="true"
              />
              <span className="text-sm font-semibold">XREAL XR Hackathon 우수상</span>
            </div>
            <div className="text-xs text-muted-foreground">레시피 추천 VR 어시스턴트 | 클라이언트 개발</div>
          </div>
        </li>
        {/* 2 */}
        <li className="flex gap-4 items-start">
          <span className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-orange-300" aria-hidden="true" />
          <div className="w-full bg-muted/25 dark:bg-muted/40 p-4 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">2024.10</div>
            <div className="flex items-center gap-2 mb-1">
              <Image
                src="/apoc.png"
                alt="APOC 로고"
                width={24}
                height={24}
                className="rounded-xs"
                aria-hidden="true"
              />
              <span className="text-sm font-semibold">2024 메타버스 개발자 경진대회 우수상</span>
            </div>
            <div className="text-xs text-muted-foreground">APOC을 활용한 KBO 구단 브랜딩 XR 웹 서비스 | 팀장 </div>
          </div>
        </li>
      </ol>
      {/* Certification 타임라인 */}
      <h2 className="text-xl font-semibold mb-4">Certification.</h2>
      <ol className="relative border-l-2 border-orange-200 pl-6 space-y-6">
        <li className="flex gap-4 items-start">
          <span className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-orange-300" aria-hidden="true" />
          <div className="w-full bg-muted/25 dark:bg-muted/40 p-4 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">2025.06</div>
            <div className="flex items-center gap-2 mb-1">
              <Image
                src="/gtqi.png"
                alt="GTQ-i 로고"
                width={24}
                height={24}
                className="rounded-xs"
                aria-hidden="true"
              />
              <span className="text-sm font-semibold">GTQ-i 1급</span>
            </div>
          </div>
        </li>
        <li className="flex gap-4 items-start">
          <span className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-orange-300" aria-hidden="true" />
          <div className="w-full bg-muted/25 dark:bg-muted/40 p-4 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">2025.06</div>
            <div className="flex items-center gap-2 mb-1">
              <Image
                src="/k-data.png"
                alt="K-data 로고"
                width={24}
                height={24}
                className="rounded-xs"
                aria-hidden="true"
              />
              <span className="text-sm font-semibold">SQLD</span>
            </div>
          </div>
        </li>
        <li className="flex gap-4 items-start">
          <span className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-orange-300" aria-hidden="true" />
          <div className="w-full bg-muted/25 dark:bg-muted/40 p-4 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">2025.08</div>
            <div className="flex items-center gap-2 mb-1">
              <Image
                src="/gtq.png"
                alt="GTQ 로고"
                width={24}
                height={24}
                className="rounded-xs"
                aria-hidden="true"
              />
              <span className="text-sm font-semibold">GTQ 1급</span>
            </div>
          </div>
        </li>
        <li className="flex gap-4 items-start">
          <span className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-orange-300" aria-hidden="true" />
          <div className="w-full bg-muted/25 dark:bg-muted/40 p-4 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">2025.09</div>
            <div className="flex items-center gap-2 mb-1">
              <Image
                src="/k-data.png"
                alt="K-data 로고"
                width={24}
                height={24}
                className="rounded-xs"
                aria-hidden="true"
              />
              <span className="text-sm font-semibold">ADsP</span>
            </div>
          </div>
        </li>
      </ol>
    </section>
  );
}
