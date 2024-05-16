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
import { UserInDepartment } from 'src/notification/serviceBasedEmail/userInDepartment';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiForbiddenResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger'

@ApiTags('Departments')
@ApiBearerAuth()
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService , private readonly usersService: UsersService ) {}

  @UseGuards(AuthGuard, AdminGuard)
  @Post()
  @ApiOperation({summary : 'Create department'})
  @ApiCreatedResponse({ description: 'Department created' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  @ApiForbiddenResponse({ description: 'Forbidden exception' })
  @ApiBadRequestResponse({ description: 'Badrequest exception' })
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
  @ApiOperation({ summary: 'Get all departments' })
  @ApiResponse({ description: 'List of departments' })
  // @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  // @ApiForbiddenResponse({ description: 'Forbidden exception' })
  // @ApiBadRequestResponse({ description: 'Badrequest exception' })
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
  @ApiOperation({ summary: 'Get department from id' })
  @ApiResponse({ description: 'Get single department' })
  // @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  // @ApiForbiddenResponse({ description: 'Forbidden exception' })
  // @ApiBadRequestResponse({ description: 'Badrequest exception' })
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
  @ApiOperation({ summary: 'Update department' })
  @ApiResponse({ description: 'Updates a department' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  @ApiForbiddenResponse({ description: 'Forbidden exception' })
  @ApiBadRequestResponse({ description: 'Badrequest exception' })
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
  @ApiOperation({ summary: 'Remove user from department' })
  @ApiResponse({ description: "deletes user from department" })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  @ApiForbiddenResponse({ description: 'Forbidden exception' })
  @ApiBadRequestResponse({ description: 'Badrequest exception' })
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
  @ApiOperation({ summary: 'Add user to department' })
  @ApiResponse({ description: "adds user to department" })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  @ApiForbiddenResponse({ description: 'Forbidden exception' })
  @ApiBadRequestResponse({ description: 'Badrequest exception' })
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

  @Get('/:id/users')
  @ApiOperation({ summary: 'Get all users from department' })
  @ApiResponse({ description: "return all users in a department" })
  // @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  // @ApiForbiddenResponse({ description: 'Forbidden exception' })
  // @ApiBadRequestResponse({ description: 'Badrequest exception' })
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
  @ApiOperation({ summary: 'Delete department' })
  @ApiResponse({ description: "deletes a department" })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  @ApiForbiddenResponse({ description: 'Forbidden exception' })
  @ApiBadRequestResponse({ description: 'Badrequest exception' })
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
