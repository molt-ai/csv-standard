import { NextRequest, NextResponse } from 'next/server';
import { listSpreadsheets, createSpreadsheet, getSheetNames } from '@/lib/google';

export async function GET(request: NextRequest) {
  const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');
  const spreadsheetId = request.nextUrl.searchParams.get('spreadsheetId');
  
  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    if (spreadsheetId) {
      // Get sheet names for a specific spreadsheet
      const sheets = await getSheetNames(accessToken, spreadsheetId);
      return NextResponse.json({ sheets });
    }
    
    // List all spreadsheets
    const files = await listSpreadsheets(accessToken);
    return NextResponse.json({ spreadsheets: files });
  } catch (error) {
    console.error('Sheets API error:', error);
    return NextResponse.json({ error: 'Failed to fetch sheets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { title } = await request.json();
    const spreadsheet = await createSpreadsheet(accessToken, title);
    return NextResponse.json(spreadsheet);
  } catch (error) {
    console.error('Create sheet error:', error);
    return NextResponse.json({ error: 'Failed to create spreadsheet' }, { status: 500 });
  }
}
