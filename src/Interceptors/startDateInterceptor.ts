import { BadRequestException, CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { Request } from "express";
import { Observable } from "rxjs";

export class StartDateInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>()

    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 1);

    const date: string = request.body.startDate;
    if(date){
    const startDate = new Date(date)

    if (!this.validateStartDate(startDate, currentDate)) {
      throw new BadRequestException("Invalid Start Date")
    }
  }
    return next.handle()
  }
  private validateStartDate(startDate: Date, currentDate: Date): boolean {
    if (startDate.getTime() > currentDate.getTime()) return true
    else return false
  }
}
