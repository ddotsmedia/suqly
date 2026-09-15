import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private requestCounts = new Map<string, { count: number; resetTime: number }>();
  private readonly LIMIT_PER_MIN = 100;
  private readonly USER_LIMIT_PER_MIN = 50;
  private readonly SKIP_PATHS = ['/health', '/api/docs'];

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { path, ip } = request;

    if (this.SKIP_PATHS.some(p => path.includes(p))) {
      return true;
    }

    const key = request.user?.id ? `user:${request.user.id}` : `ip:${ip}`;
    const limit = request.user ? this.USER_LIMIT_PER_MIN : this.LIMIT_PER_MIN;
    const now = Date.now();

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
