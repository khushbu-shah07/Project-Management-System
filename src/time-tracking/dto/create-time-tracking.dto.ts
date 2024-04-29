import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, MaxLength } from "class-validator";

export class CreateTimeTrackingDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    task_id:number;

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
