import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateTimeTrackingDto {
    @IsNotEmpty()
    @IsNumber()
    task_id:number;

    @IsNotEmpty()
    @IsNumber()
    hours:number;

    @IsNotEmpty()
    @IsString()
    description:string;
}
