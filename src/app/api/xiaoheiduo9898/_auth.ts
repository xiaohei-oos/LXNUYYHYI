import { NextRequest, NextResponse } from 'next/server';
import { isValidSession } from './login/route';

export function requireAdmin(request: NextRequest) {
  // Check x-admin-token header first
  const token = request.headers.get('x-admin-token');
  if (token && isValidSession(token)) {
    return null; // Authenticated
  }

  // Fallback: check cookie for backward compatibility
  const cookieSession = request.cookies.get('admin_session')?.value;
  if (cookieSession === 'authenticated') {
    return null; // Authenticated (legacy cookie)
  }

  return NextResponse.json(
    { error: '未授权访问' },
    { status: 401 }
  );
}
