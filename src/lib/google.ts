import { google } from 'googleapis';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/google/callback`
  );
}

export function getAuthUrl(state: string) {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state,
    prompt: 'consent',
  });
}

export async function getTokens(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export async function listSpreadsheets(accessToken: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });
  
  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  const res = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.spreadsheet'",
    fields: 'files(id, name)',
    pageSize: 50,
  });
  
  return res.data.files || [];
}

export async function createSpreadsheet(accessToken: string, title: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });
  
  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
  const res = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title },
    },
  });
  
  return {
    id: res.data.spreadsheetId!,
    name: res.data.properties?.title || title,
  };
}

export async function appendToSheet(
  accessToken: string,
  refreshToken: string,
  spreadsheetId: string,
  sheetName: string,
  headers: string[],
  rows: string[][]
) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ 
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  
  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
  
  // Check if sheet has headers, if not add them
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A1:1`,
  });
  
  const values = [];
  if (!existing.data.values || existing.data.values.length === 0) {
    values.push(headers);
  }
  values.push(...rows);
  
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });
  
  return { rowsAdded: rows.length };
}

export async function getSheetNames(accessToken: string, spreadsheetId: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });
  
  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
  const res = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties.title',
  });
  
  return res.data.sheets?.map(s => s.properties?.title || 'Sheet1') || ['Sheet1'];
}
