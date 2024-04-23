import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
@Injectable()
export class EndDateValidationPipe implements PipeTransform{
  transform(value: any, metadata: ArgumentMetadata) {
      const endDate = new Date(value.expectedEndDate) 
      const startDate = new Date(value.startDate)
      if (!this.validateEndDate(endDate, startDate)) {
        throw new BadRequestException("Invalid End Date")
      }
      return value
  }
    private validateEndDate(endDate: Date, startDate: Date): boolean {
    if (endDate.getTime() > startDate.getTime()) return true
    else return false
  }
}
