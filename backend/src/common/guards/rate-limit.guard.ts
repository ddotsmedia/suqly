import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private requestCounts = new Map<string, { count: number; resetTime: number }>();
  private readonly LIMIT_PER_MIN = 100;
  private readonly USER_LIMIT_PER_MIN = 50;
  private readonly SKIP_PATHS = ['/health', '/api/docs'];
  // Stricter per-IP limits on endpoints that send SMS or verify codes
  private readonly AUTH_LIMITS: Record<string, number> = { '/auth/login': 5, '/auth/verify-otp': 10 };

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { path, ip } = request;

    if (this.SKIP_PATHS.some(p => path.includes(p))) {
      return true;
    }

    const authLimit = Object.entries(this.AUTH_LIMITS).find(([p]) => path.endsWith(p))?.[1];
    const base = request.user?.id ? `user:${request.user.id}` : `ip:${ip}`;
    const key = authLimit ? `${base}:${path}` : base;
    const limit = authLimit ?? (request.user ? this.USER_LIMIT_PER_MIN : this.LIMIT_PER_MIN);
    const now = Date.now();

    if (this.requestCounts.size > 10000) {
      for (const [k, r] of this.requestCounts) {
        if (now > r.resetTime) this.requestCounts.delete(k);
      }
    }

    let record = this.requestCounts.get(key);

    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + 60000 };
    } else {
      record.count++;
      if (record.count > limit) {
        throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS);
      }
    }

    this.requestCounts.set(key, record);
    return true;
  }
}
