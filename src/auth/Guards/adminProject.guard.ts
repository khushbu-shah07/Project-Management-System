import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminProjectGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const userRole = request.user?.role;

    const isAdminProject = userRole === 'admin' || userRole === 'pm';

    if (isAdminProject) return true;
    else throw new ForbiddenException('Access Denied');
  }
}
