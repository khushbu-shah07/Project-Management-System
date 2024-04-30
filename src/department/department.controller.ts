import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
  UseGuards,
  HttpException,
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
import { UserInDepartment } from 'src/notification/serviceBasedEmail/userInDepartment';

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
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
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
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
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
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
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
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Delete('/users')
  async removeUserFromDepartment(
    @Body() departmentUserData: CreateDepartmentUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.departmentService.removeFromDepartment(departmentUserData);
      const adminId=req['user'].id;

      UserInDepartment.addOrRemoveUser( this.usersService , adminId,'Removed',departmentUserData)

      return sendResponse(
        res,
        httpStatusCodes.Created,
        'success',
        'Remove user from department',
        null,
      );
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  @UseGuards(AuthGuard, AdminGuard)
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

        UserInDepartment.addOrRemoveUser( this.usersService , adminId,'Added',departmentUserData)

      return sendResponse(
        res,
        httpStatusCodes.Created,
        'success',
        'Add user to department',
        departmentUser,
      );
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
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
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  @UseGuards(AuthGuard, AdminGuard)
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
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }
}
