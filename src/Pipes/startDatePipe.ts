import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
@Injectable()
export class StartDateValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 1)
    if (value.startDate) {
      const startDate = new Date(value.startDate)
      if (!this.validateStartDate(startDate, currentDate)) {
        throw new BadRequestException("Invalid Start Date")
      }
    }
    return value
  }
  private validateStartDate(startDate: Date, currentDate: Date): boolean {
    if (startDate.getTime() > currentDate.getTime()) return true
    else return false
  }
}
