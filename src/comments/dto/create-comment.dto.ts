import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, MaxLength } from "class-validator";

export class CreateCommentDto {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()  
    task_id:number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    content:string;

}

