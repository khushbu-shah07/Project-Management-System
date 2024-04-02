import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateCommentDto {
    @IsNotEmpty()
    @IsNumber()
    task_id:number;

    @IsNotEmpty()
    @IsString()
    content:string;
    
}
