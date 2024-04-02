import { BadRequestException, CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { Request } from "express";
import { Observable } from "rxjs";

export class EndDateInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>()

    const eDate = request.body.expectedEndDate;
    const endDate = new Date(eDate)

    const sDate = request.body.startDate;
    const startDate = new Date(sDate)

    if (!this.validateEndDate(endDate, startDate)) {
      throw new BadRequestException("Invalid End Date")
    }

    return next.handle()
  }

  private validateEndDate(endDate: Date, startDate: Date): boolean {
    if (endDate.getTime() > startDate.getTime()) return true
    else return false
  }
}
