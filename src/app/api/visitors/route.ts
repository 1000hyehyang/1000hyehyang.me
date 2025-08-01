import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

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

interface IPVisitorsData {
  [ip: string]: {
    lastVisited: string;
  };
}

interface CookieVisitorsData {
  [visitorId: string]: {
    lastVisited: string;
    ip: string;
  };
}

const isToday = (dateString: string): boolean => {
  const today = new Date().toDateString();
  const date = new Date(dateString).toDateString();
  return today === date;
};

const getClientIP = async (): Promise<string> => {
  const headersList = await headers();
  
  // 다양한 헤더에서 IP 확인
  const forwarded = headersList.get("x-forwarded-for");
  const realIP = headersList.get("x-real-ip");
  const cfConnectingIP = headersList.get("cf-connecting-ip");
  
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // IPv6 루프백 주소도 localhost로 처리
  return "localhost";
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

const getIPVisitorsData = async (): Promise<IPVisitorsData> => {
  // Redis가 설정되지 않은 경우 기본값 반환
  if (!redis) {
    return {};
  }

  try {
    const data = await redis.get("ip_visitors");
    if (data) {
      return data as IPVisitorsData;
    }
  } catch (error) {
    console.error("Redis에서 IP 방문자 데이터 조회 실패:", error);
  }
  
  return {};
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

const setIPVisitorsData = async (data: IPVisitorsData): Promise<void> => {
  // Redis가 설정되지 않은 경우 아무것도 하지 않음
  if (!redis) {
    return;
  }

  try {
    await redis.set("ip_visitors", data);
  } catch (error) {
    console.error("Redis에 IP 방문자 데이터 저장 실패:", error);
  }
};

const getCookieVisitorsData = async (): Promise<CookieVisitorsData> => {
  // Redis가 설정되지 않은 경우 기본값 반환
  if (!redis) {
    return {};
  }

  try {
    const data = await redis.get("cookie_visitors");
    if (data) {
      return data as CookieVisitorsData;
    }
  } catch (error) {
    console.error("Redis에서 Cookie 방문자 데이터 조회 실패:", error);
  }
  
  return {};
};

const setCookieVisitorsData = async (data: CookieVisitorsData): Promise<void> => {
  // Redis가 설정되지 않은 경우 아무것도 하지 않음
  if (!redis) {
    return;
  }

  try {
    await redis.set("cookie_visitors", data);
  } catch (error) {
    console.error("Redis에 Cookie 방문자 데이터 저장 실패:", error);
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
    const clientIP = await getClientIP();
    const cookieStore = await cookies();
    
    // Cookie에서 방문자 ID 가져오기
    let visitorId = cookieStore.get('visitor_id')?.value;
    
    // 방문자 ID가 없으면 새로 생성
    if (!visitorId) {
      visitorId = randomUUID();
    }
    
    // Cookie 방문자 데이터 확인
    const cookieVisitorsData = await getCookieVisitorsData();
    const cookieData = cookieVisitorsData[visitorId];
    
    // 같은 방문자가 오늘 이미 방문한 경우 카운트 증가하지 않음
    if (cookieData && isToday(cookieData.lastVisited)) {
      const data = await getVisitorsData();
      const response = NextResponse.json({
        today: data.today,
        total: data.total,
        lastUpdated: data.lastUpdated
      });
      
      // 방문자 ID가 없으면 쿠키 설정
      if (!cookieStore.get('visitor_id')) {
        response.cookies.set('visitor_id', visitorId, {
          maxAge: 60 * 60 * 24 * 365, // 1년
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
      }
      
      return response;
    }
    
    // 새로운 방문자이거나 오늘 처음 방문한 경우
    const data = await getVisitorsData();
    
    // 오늘이 아닌 경우 today 카운트 리셋
    if (!isToday(data.lastUpdated)) {
      data.today = 0;
    }
    
    // 방문자 수 증가
    data.today += 1;
    data.total += 1;
    data.lastUpdated = new Date().toISOString();
    
    // Cookie 방문 기록 업데이트
    cookieVisitorsData[visitorId] = {
      lastVisited: new Date().toISOString(),
      ip: clientIP
    };
    
    await setVisitorsData(data);
    await setCookieVisitorsData(cookieVisitorsData);
    
    const response = NextResponse.json({
      today: data.today,
      total: data.total,
      lastUpdated: data.lastUpdated
    });
    
    // 방문자 ID 쿠키 설정
    response.cookies.set('visitor_id', visitorId, {
      maxAge: 60 * 60 * 24 * 365, // 1년
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    return response;
  } catch (error) {
    console.error("방문자 수 증가 실패:", error);
    return NextResponse.json(
      { error: "방문자 수를 증가시킬 수 없습니다." },
      { status: 500 }
    );
  }
} 