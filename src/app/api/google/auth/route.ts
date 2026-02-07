import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/google';

export async function GET(request: NextRequest) {
  const templateId = request.nextUrl.searchParams.get('templateId');
  
  if (!templateId) {
    return NextResponse.json({ error: 'Missing templateId' }, { status: 400 });
  }
  
  const authUrl = getAuthUrl(templateId);
  return NextResponse.redirect(authUrl);
}
