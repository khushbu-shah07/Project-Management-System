import { BadRequestException } from "@nestjs/common";
import { CreateDepartmentUserDto } from "src/department/dto/create-department-user.dto";
import sendNotifyEmail from "../Email/sendNotifyMail";
import { UsersService } from "src/users/users.service";

export class UserInDepartment {
    
    static async addOrRemoveUser(usersService: UsersService, adminId: number, typeOfOperation: string, departmentUserData: CreateDepartmentUserDto) {
        try {
            const adminDetail = await usersService.findOne(adminId);
            const adminEmail = adminDetail.email;
            
            const user = await usersService.findOne(departmentUserData.user_id);
            const userEmail = user.email;
            
            sendNotifyEmail(adminEmail, userEmail, `You have been ${typeOfOperation} to the department`, 'None', 'None');
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}
