import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Get the secret key for signing/verifying tokens
function getSecret(): string {
  const secret = process.env.ADMIN_PASSWORD || 'fallback-secret-key';
  return secret;
}

// Generate a signed token (stateless, no memory storage needed)
export function generateToken(): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(8).toString('hex');
  const payload = `${timestamp}:${random}`;
  const signature = crypto.createHmac('sha256', getSecret()).update(payload).digest('hex').slice(0, 16);
  return `${payload}:${signature}`;
}

// Verify a signed token (stateless)
export function isValidToken(token: string): boolean {
  if (!token) return false;
  const parts = token.split(':');
  if (parts.length !== 3) return false;
  const [timestampStr, random, signature] = parts;
  const payload = `${timestampStr}:${random}`;
  const expectedSignature = crypto.createHmac('sha256', getSecret()).update(payload).digest('hex').slice(0, 16);
  if (signature !== expectedSignature) return false;
  // Check expiration: 24 hours
  const timestamp = parseInt(timestampStr, 36);
  if (Date.now() - timestamp > 24 * 60 * 60 * 1000) return false;
  return true;
}

export function requireAdmin(request: NextRequest) {
  // Check Authorization: Bearer <token> header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    if (token && isValidToken(token)) {
      return null; // Authenticated
    }
  }

  // Check x-admin-token header (alternative)
  const xToken = request.headers.get('x-admin-token');
  if (xToken && isValidToken(xToken)) {
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
