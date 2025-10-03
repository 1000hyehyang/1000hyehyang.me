import { NextResponse } from "next/server";
import { getRedisClient, getClientIP } from "@/lib/api-utils";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const redis = getRedisClient();

interface VisitorsData {
  today: number;
  total: number;
  lastUpdated: string;
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


// 방문자 수 계산 데이터 관리
const getVisitorsData = async (): Promise<VisitorsData> => {
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
  
  return {
    today: 0,
    total: 0,
    lastUpdated: new Date().toISOString()
  };
};

const setVisitorsData = async (data: VisitorsData): Promise<void> => {
  if (!redis) {
    return;
  }

  try {
    await redis.set("visitors", data);
  } catch (error) {
    console.error("Redis에 방문자 데이터 저장 실패:", error);
  }
};

// Cookie 방문자 데이터를 Sorted Set으로 관리 (시간순 정렬)
const getCookieVisitorsData = async (): Promise<CookieVisitorsData> => {
  if (!redis) {
    return {};
  }

  try {
    const results = await redis.zrange("cookie_visitors", 0, -1, { withScores: true });
    const visitorDetails = await redis.hgetall("cookie_visitors_details");
    const visitorsData: CookieVisitorsData = {};
    
    for (let i = 0; i < results.length; i += 2) {
      const visitorId = results[i] as string;
      const score = results[i + 1] as number;
      
      const details = visitorDetails?.[visitorId];
      if (details) {
        try {
          // details가 이미 객체인지 문자열인지 확인
          let parsedDetails;
          if (typeof details === 'string') {
            parsedDetails = JSON.parse(details);
          } else {
            parsedDetails = details;
          }
          
          visitorsData[visitorId] = {
            lastVisited: new Date(score).toISOString(),
            ip: parsedDetails.ip
          };
        } catch (error) {
          console.error(`방문자 ${visitorId} 상세 정보 파싱 실패:`, error);
        }
      }
    }
    
    return visitorsData;
  } catch (error) {
    console.error("Cookie 방문자 데이터 조회 실패:", error);
    return {};
  }
};

// 특정 방문자의 방문 시간 업데이트
const updateVisitorVisitTime = async (visitorId: string, lastVisited: string, ip: string): Promise<void> => {
  if (!redis) {
    return;
  }

  try {
    const visitTime = new Date(lastVisited).getTime();
    
    await redis.zadd("cookie_visitors", { score: visitTime, member: visitorId });
    
    // Hash에는 객체 형태로 저장 (JSON.stringify 하지 않음)
    await redis.hset("cookie_visitors_details", { [visitorId]: {
      lastVisited,
      ip
    } });
  } catch (error) {
    console.error("방문자 방문 시간 업데이트 실패:", error);
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
    
    let visitorId = cookieStore.get('visitor_id')?.value;
    
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
      
      if (!cookieStore.get('visitor_id')) {
        response.cookies.set('visitor_id', visitorId, {
          maxAge: 60 * 60 * 24 * 365,
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
    
    // 방문자 추적 데이터 업데이트
    await updateVisitorVisitTime(visitorId, new Date().toISOString(), clientIP);
    
    // 방문자 수 데이터 저장
    await setVisitorsData(data);
    
    const response = NextResponse.json({
      today: data.today,
      total: data.total,
      lastUpdated: data.lastUpdated
    });
    
    response.cookies.set('visitor_id', visitorId, {
      maxAge: 60 * 60 * 24 * 365,
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