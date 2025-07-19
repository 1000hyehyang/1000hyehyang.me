import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const VISITORS_FILE = path.join(process.cwd(), "data", "visitors.json");

interface VisitorsData {
  today: number;
  total: number;
  lastUpdated: string;
}

const ensureDataDirectory = async () => {
  const dataDir = path.dirname(VISITORS_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
};

const readVisitorsData = async (): Promise<VisitorsData> => {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(VISITORS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    // 파일이 없거나 읽기 실패 시 기본값 반환
    return {
      today: 0,
      total: 0,
      lastUpdated: new Date().toISOString()
    };
  }
};

const writeVisitorsData = async (data: VisitorsData) => {
  await ensureDataDirectory();
  await fs.writeFile(VISITORS_FILE, JSON.stringify(data, null, 2));
};

const isToday = (dateString: string): boolean => {
  const today = new Date().toDateString();
  const date = new Date(dateString).toDateString();
  return today === date;
};

export async function GET() {
  try {
    const data = await readVisitorsData();
    
    // 오늘이 아닌 경우 today 카운트 리셋
    if (!isToday(data.lastUpdated)) {
      data.today = 0;
      data.lastUpdated = new Date().toISOString();
      await writeVisitorsData(data);
    }
    
    return NextResponse.json({
      today: data.today,
      total: data.total,
      lastUpdated: data.lastUpdated
    });
  } catch (error) {
    console.error("방문자 수 조회 실패:", error);
    return NextResponse.json(
      { error: "방문자 수를 조회할 수 없습니다." },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const data = await readVisitorsData();
    
    // 오늘이 아닌 경우 today 카운트 리셋
    if (!isToday(data.lastUpdated)) {
      data.today = 0;
    }
    
    // 방문자 수 증가
    data.today += 1;
    data.total += 1;
    data.lastUpdated = new Date().toISOString();
    
    await writeVisitorsData(data);
    
    return NextResponse.json({
      today: data.today,
      total: data.total,
      lastUpdated: data.lastUpdated
    });
  } catch (error) {
    console.error("방문자 수 증가 실패:", error);
    return NextResponse.json(
      { error: "방문자 수를 증가시킬 수 없습니다." },
      { status: 500 }
    );
  }
} 