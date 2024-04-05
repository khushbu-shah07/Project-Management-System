import { PartialType } from '@nestjs/mapped-types';
import { CreateReportGenerationDto } from './create-report-generation.dto';

export class UpdateReportGenerationDto extends PartialType(CreateReportGenerationDto) {}
