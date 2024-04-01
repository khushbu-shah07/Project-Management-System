// import { BadRequestException, CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
// import { Request } from "express";
// import { Observable } from "rxjs";

// export class StartDateInterceptor implements NestInterceptor {
//   intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
//     const request = context.switchToHttp().getRequest<Request>()
//     const date: string = request.body.startDate;
//     const startDate = new Date 
//     if (!this.validateStartDate(startDate)) {
//       throw new BadRequestException("Invalid Start Date")
//     }
//     return next.handle()
//   }
//   private validateStartDate(startDate: string): boolean {
//     if (startDate.toDa)
//   }
// }