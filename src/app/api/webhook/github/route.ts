import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    
    // GitHub Webhook 시크릿 검증
    if (process.env.GITHUB_WEBHOOK_SECRET) {
      const expectedSignature = `sha256=${crypto
        .createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET)
        .update(body)
        .digest('hex')}`;
      
      if (signature !== expectedSignature) {
        return NextResponse.json(
          { error: '유효하지 않은 webhook signature입니다.' },
          { status: 403 }
        );
      }
    }
    
    const payload = JSON.parse(body);
    
    // Discussion 이벤트인지 확인
    const isDiscussionEvent = payload.action && ['created', 'edited', 'deleted'].includes(payload.action);
    const isDiscussionCommentEvent = payload.discussion && payload.action;
    const isPushEvent = payload.ref && payload.commits; // Push 이벤트도 감지
    
    if (isDiscussionEvent || isDiscussionCommentEvent || isPushEvent) {
      // 블로그 관련 페이지들 재검증
      await Promise.all([
        revalidatePath('/blog'),
        revalidatePath('/blog/[slug]', 'page'),
        revalidateTag('github-discussions'),
        revalidatePath('/sitemap.xml')
      ]);
      
      console.log(`GitHub 이벤트 (${payload.action || 'push'})로 캐시 갱신 완료`);
      
      return NextResponse.json({ 
        success: true, 
        message: '캐시 갱신 완료',
        action: payload.action || 'push'
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '이벤트 무시됨' 
    });
    
  } catch (error) {
    console.error('GitHub Webhook 처리 실패:', error);
    return NextResponse.json(
      { error: 'Webhook 처리에 실패했습니다.' },
      { status: 500 }
    );
  }
}
