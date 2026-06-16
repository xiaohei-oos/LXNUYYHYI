import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '../_auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: '请输入用户名和密码' }, { status: 400 });
    }

    const validUsername = 'xysales';
    const validPassword = process.env.ADMIN_PASSWORD;

    if (!validPassword) {
      console.error('ADMIN_PASSWORD environment variable not set');
      return NextResponse.json({ error: '管理员密码未配置' }, { status: 500 });
    }

    if (username !== validUsername || password !== validPassword) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
    }

    // Generate stateless signed token
    const token = generateToken();

    // Also set cookie for backward compatibility
    const response = NextResponse.json({
      success: true,
      token,
    });

    response.cookies.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: '登录请求失败' }, { status: 500 });
  }
}
