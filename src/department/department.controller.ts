import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  Req,
  Res,
  InternalServerErrorException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { httpStatusCodes, sendResponse } from 'utils/sendresponse';
import { Request, Response } from 'express';
import { CreateDepartmentUserDto } from './dto/create-department-user.dto';
import { AdminGuard } from 'src/auth/Guards/admin.guard';
import { AuthGuard } from 'src/auth/Guards/auth.guard';
import { UsersService } from 'src/users/users.service';
import sendNotifyEmail from 'src/notification/Email/sendNotifyMail';

@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService , private readonly usersService: UsersService ) {}

  @UseGuards(AuthGuard, AdminGuard)
  @Post()
  async create(
    @Body() createDepartmentDto: CreateDepartmentDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const department =
        await this.departmentService.create(createDepartmentDto);
      return sendResponse(
        res,
        httpStatusCodes.Created,
        'success',
        'Create department',
        department,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  async findAll(@Req() req: Request, @Res() res: Response) {
    try {
      const departments = await this.departmentService.findAll();
      return sendResponse(
        res,
        httpStatusCodes.OK,
        'success',
        'Get all departments',
        departments,
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const department = await this.departmentService.findOne(+id);
      return sendResponse(
        res,
        httpStatusCodes.OK,
        'success',
        'Get department by id',
        department,
      );
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.departmentService.update(+id, updateDepartmentDto);
      return sendResponse(
        res,
        httpStatusCodes.OK,
        'success',
        'Update department',
        null,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(AuthGuard ,AdminGuard)
  @Delete('/users')
  async removeUserFromDepartment(
    @Body() departmentUserData: CreateDepartmentUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.departmentService.removeFromDepartment(departmentUserData);
      const adminId=req['user'].id;
      console.log("adminDetail ",adminId)
      const adminDetail =await this.usersService.findOne(adminId);
      const adminEmail = adminDetail.email;
      const user = await this.usersService.findOne(departmentUserData.user_id);
      const userEmail =user.email;
      sendNotifyEmail(adminEmail,userEmail,`you have been removed from department`,'None','None')
      
      return sendResponse(
        res,
        httpStatusCodes.Created,
        'success',
        'Remove user from department',
        null,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(AuthGuard ,AdminGuard)
  @Post('/users')
  async addUserToDepartment(
    @Body() departmentUserData: CreateDepartmentUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const departmentUser =
        await this.departmentService.addUserToDepartment(departmentUserData);

        const adminId=req['user'].id;
        console.log("adminDetail ",adminId)
        const adminDetail =await this.usersService.findOne(adminId);
        const adminEmail = adminDetail.email;
        const user = await this.usersService.findOne(departmentUserData.user_id);
        const userEmail =user.email;
        sendNotifyEmail(adminEmail,userEmail,`you have been added in department`,'None','None')

      return sendResponse(
        res,
        httpStatusCodes.Created,
        'success',
        'Add user to department',
        departmentUser,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('/users/:id')
  async getDepartmentUsers(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const departmentUsers =
        await this.departmentService.findDepartmentUsers(+id);
      return sendResponse(
        res,
        httpStatusCodes.OK,
        'success',
        'Get department users',
        departmentUsers,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(AuthGuard ,AdminGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.departmentService.remove(+id);
      return sendResponse(
        res,
        httpStatusCodes.OK,
        'success',
        'Delete department',
        null,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
