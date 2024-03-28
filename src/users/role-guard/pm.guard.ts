import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ProjectManagerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    const userRole = request.user?.role; 

    const isProjectManager = userRole === 'pm';
    
     if(isProjectManager){
        return true;
     }
     else{
        throw new UnauthorizedException('only project manager has access');
     }
  }
}
