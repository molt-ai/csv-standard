import { NextRequest, NextResponse } from 'next/server';
import { appendToSheet } from '@/lib/google';

export async function POST(request: NextRequest) {
  try {
    const { accessToken, refreshToken, spreadsheetId, sheetName, headers, rows } = await request.json();
    
    if (!accessToken || !spreadsheetId || !rows) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const result = await appendToSheet(
      accessToken,
      refreshToken,
      spreadsheetId,
      sheetName || 'Sheet1',
      headers,
      rows
    );
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Append error:', error);
    return NextResponse.json({ error: 'Failed to append data' }, { status: 500 });
  }
}
