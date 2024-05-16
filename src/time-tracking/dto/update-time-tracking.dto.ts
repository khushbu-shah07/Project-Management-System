import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateTimeTrackingDto } from './create-time-tracking.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class UpdateTimeTrackingDto extends PartialType(OmitType(CreateTimeTrackingDto,['task_id'])) {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    hours:number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @MaxLength(200)
    description:string;
}
