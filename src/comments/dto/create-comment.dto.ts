import { IsNotEmpty, IsNumber, IsString, MaxLength } from "class-validator";

export class CreateCommentDto {
    @IsNumber()
    @IsNotEmpty()   
    task_id:number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    content:string;

}

