import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateCommentDto {
    @IsNumber()
    @IsNotEmpty()
    task_id:number;

    @IsString()
    @IsNotEmpty()
    content:string;

}
