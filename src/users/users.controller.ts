import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, BadRequestException, UseGuards, ForbiddenException, HttpException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request, Response } from 'express';
import { httpStatusCodes, sendResponse } from "../../utils/sendresponse";
import { AuthGuard } from '../auth/Guards/auth.guard';
import { AdminGuard } from '../auth/Guards/admin.guard';
import { User } from './entities/user.entity';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  //create User
  @UseGuards(AuthGuard,AdminGuard)
  @Post()
  @ApiOperation({ summary: 'Create User' })
  @ApiCreatedResponse({ status: 201, description: 'User Created' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({  description: 'Forbidden Exception' })
  @ApiBadRequestResponse({description:"BadRequest Exception"}) 
  @ApiBody({
    description: 'User details',
    type: CreateUserDto,
  })
  async create(@Body() createUserDto: CreateUserDto, @Req() req: Request, @Res() res: Response) {
    try {
      const user = await this.usersService.create(createUserDto)
      return sendResponse(res, httpStatusCodes.Created, "success", "Create User", user)
    } catch (error) {
      throw new HttpException(error.message, error.status||httpStatusCodes['Bad Request'])
    }
  }

  // Get all Users
  @UseGuards(AuthGuard, AdminGuard)
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({  description: 'Forbidden Exception' })
  @ApiBadRequestResponse({description:"BadRequest Exception"}) 
  async findAll(@Req() req: Request, @Res() res: Response) {
    try {
      const users = await this.usersService.findAll()
      return sendResponse(res, httpStatusCodes.OK, "success", "Get All User", users)
    } catch (error) {
      throw new HttpException(error.message, error.status||httpStatusCodes['Bad Request'])
    }
  }

  //Get Single User
  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get Single user' })
  @ApiResponse({ status: 200, description: 'Single user Found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({  description: 'Forbidden Exception' })
  @ApiBadRequestResponse({description:"BadRequest Exception"}) 
  async findOne(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    try {
      const user = await this.usersService.findOne(+id)
      if (req['user'].role !== 'admin') {
        if (req['user'].id !== +id) {
          throw new ForbiddenException("Access Denied to Fetch Single User")
        }
      }
      return sendResponse(res, httpStatusCodes.OK, "success", "Get Single User", user)
    } catch (error) {
      throw new HttpException(error.message,error.status||httpStatusCodes['Bad Request'])
    }
  }

  //Update User
  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update User' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({  description: 'Forbidden Exception' })
  @ApiBadRequestResponse({description:"BadRequest Exception"}) 
  @ApiNotFoundResponse({ description: 'Not Found'})
  async update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: Request, @Res() res: Response) {
    try {
      let data: User
      if(req.body.email||req.body.role){
        throw new ForbiddenException("You can not update email or role")
      }
      if (req['user'].role === 'admin') {
        data = await this.usersService.update(+id, updateUserDto)
      }
      else {
        if (+id === req['user'].id) {
          data = await this.usersService.update(req['user'].id, updateUserDto)
        }
        else{
          throw new ForbiddenException("Access Denied")
        }
      }
      return sendResponse(res, httpStatusCodes.OK, "success", "Update User", data)
    } catch (error) {
      throw new HttpException(error.message, error.status||httpStatusCodes['Bad Request'])
    }
  }

  //Delete User
  @UseGuards(AuthGuard)
  @Delete(":id")
  @ApiOperation({ summary: 'Delete User' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({  description: 'Forbidden Exception' })
  @ApiBadRequestResponse({description:"BadRequest Exception"}) 
  @ApiNotFoundResponse({ description: 'Not Found'})
  async remove(@Req() req: Request, @Res() res: Response, @Param('id') id: string) {
    try {
      let data: Number;
      if (req['user'].role === 'admin') {
        data = await this.usersService.remove(+id)
      }
      else {
        if (+id === req['user'].id) {
          data = await this.usersService.remove(req['user'].id)
        }
        else {
          throw new ForbiddenException("You Can Not Delete")
        }

      }
      return sendResponse(res, httpStatusCodes.OK, "success", "Delete User", { deletedUser: data })
    } catch (error) {
      throw new HttpException(error.message, error.status||httpStatusCodes['Bad Request'])
    }
  }
}
