import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateTimeTrackingDto } from './create-time-tracking.dto';

export class UpdateTimeTrackingDto extends PartialType(OmitType(CreateTimeTrackingDto,['task_id'])) {}
