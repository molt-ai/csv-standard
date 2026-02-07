import { NextRequest, NextResponse } from 'next/server';
import { getTokens } from '@/lib/google';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const templateId = request.nextUrl.searchParams.get('state');
  
  if (!code || !templateId) {
    return NextResponse.redirect(new URL('/?error=missing_params', request.url));
  }
  
  try {
    const tokens = await getTokens(code);
    
    // Store tokens in URL params for client to save
    const redirectUrl = new URL(`/templates/${templateId}/connect`, request.url);
    redirectUrl.searchParams.set('access_token', tokens.access_token || '');
    redirectUrl.searchParams.set('refresh_token', tokens.refresh_token || '');
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(new URL('/?error=oauth_failed', request.url));
  }
}
