import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// 환경 변수가 없으면 null로 설정
const redis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  ? new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  : null;

interface VisitorsData {
  today: number;
  total: number;
  lastUpdated: string;
}

const isToday = (dateString: string): boolean => {
  const today = new Date().toDateString();
  const date = new Date(dateString).toDateString();
  return today === date;
};

const getVisitorsData = async (): Promise<VisitorsData> => {
  // Redis가 설정되지 않은 경우 기본값 반환
  if (!redis) {
    return {
      today: 0,
      total: 0,
      lastUpdated: new Date().toISOString()
    };
  }

  try {
    const data = await redis.get("visitors");
    if (data) {
      return data as VisitorsData;
    }
  } catch (error) {
    console.error("Redis에서 방문자 데이터 조회 실패:", error);
  }
  
  // 기본값 반환
  return {
    today: 0,
    total: 0,
    lastUpdated: new Date().toISOString()
  };
};

const setVisitorsData = async (data: VisitorsData): Promise<void> => {
  // Redis가 설정되지 않은 경우 아무것도 하지 않음
  if (!redis) {
    return;
  }

  try {
    await redis.set("visitors", data);
  } catch (error) {
    console.error("Redis에 방문자 데이터 저장 실패:", error);
  }
};

export async function GET() {
  try {
    const data = await getVisitorsData();
    
    // 오늘이 아닌 경우 today 카운트 리셋
    if (!isToday(data.lastUpdated)) {
      data.today = 0;
      data.lastUpdated = new Date().toISOString();
      await setVisitorsData(data);
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
    const data = await getVisitorsData();
    
    // 오늘이 아닌 경우 today 카운트 리셋
    if (!isToday(data.lastUpdated)) {
      data.today = 0;
    }
    
    // 방문자 수 증가
    data.today += 1;
    data.total += 1;
    data.lastUpdated = new Date().toISOString();
    
    await setVisitorsData(data);
    
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