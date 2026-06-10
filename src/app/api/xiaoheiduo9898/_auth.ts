import { NextRequest, NextResponse } from 'next/server';

const ADMIN_SESSION_COOKIE = 'admin_session';
const SESSION_VALUE = 'authenticated';

/**
 * Verify admin session cookie. Returns null if valid, or a 401 NextResponse if invalid.
 */
export function requireAdmin(request: NextRequest): NextResponse | null {
  const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (session !== SESSION_VALUE) {
    return NextResponse.json({ error: '未授权，请先登录' }, { status: 401 });
  }

  return null;
}

/**
 * For non-NextRequest (standard Request), parse cookies manually.
 */
export function requireAdminRequest(request: Request): NextResponse | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const hasSession = cookieHeader
    .split(';')
    .some(c => c.trim().startsWith(`${ADMIN_SESSION_COOKIE}=${SESSION_VALUE}`));

  if (!hasSession) {
    return NextResponse.json({ error: '未授权，请先登录' }, { status: 401 });
  }

  return null;
}
