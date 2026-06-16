import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const ADMIN_USERNAME = 'xysales';

// Active sessions stored in memory (resets on server restart)
const activeSessions = new Map<string, { createdAt: number }>();

// Export for use in _auth.ts
export function isValidSession(token: string): boolean {
  const session = activeSessions.get(token);
  if (!session) return false;
  // Session expires after 24 hours
  if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
    activeSessions.delete(token);
    return false;
  }
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable is not set');
      return NextResponse.json({ error: '服务器配置错误' }, { status: 500 });
    }

    const body = await request.json();
    const { username, password } = body;

    if (username === ADMIN_USERNAME && password === adminPassword) {
      // Generate a random session token
      const token = crypto.randomBytes(32).toString('hex');
      activeSessions.set(token, { createdAt: Date.now() });

      return NextResponse.json({ success: true, token });
    }

    return NextResponse.json(
      { error: '用户名或密码错误' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: '请求格式错误' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const token = request.headers.get('x-admin-token');
  if (token) {
    activeSessions.delete(token);
  }
  return NextResponse.json({ success: true });
}
