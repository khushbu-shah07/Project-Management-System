import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateCommentDto } from './create-comment.dto';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto extends OmitType(CreateCommentDto,['task_id']) {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    content: string;
}
