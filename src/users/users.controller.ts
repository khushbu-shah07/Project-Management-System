import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, BadRequestException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request, Response } from 'express';
import { httpStatusCodes,sendResponse } from "../../utils/sendresponse";
import { AuthGuard } from 'src/auth/auth.guard';
import { AdminGuard } from './role-guard/admin.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Req() req:Request ,@Res() res:Response) {
    try {
      const user = await this.usersService.create(createUserDto)
      return sendResponse(res,httpStatusCodes.Created,"success","Create User",user)
    } catch (error) {
      throw new BadRequestException("Error in create User" , error.message)
    }
  }
 
  @UseGuards(AuthGuard,AdminGuard)
  @Get()
  async findAll(@Req() req:Request ,@Res() res:Response) {
    try {
      const users = await this.usersService.findAll()
      return sendResponse(res,httpStatusCodes.OK,"success","Get All User",users)
    } catch (error) {
      throw new BadRequestException("Error in FindAll User",error.message)
    }
  }
  @UseGuards(AuthGuard,AdminGuard)
  @Get(':id')
  async findOne(@Param('id') id: string,@Req() req:Request ,@Res() res:Response) {
    try {
      const user = await this.usersService.findOne(+id)
      return sendResponse(res,httpStatusCodes.OK,"success","Get Single User",user)
    } catch (error) {
      throw new BadRequestException("Error in Get Single User",error.message)
    }
  }
  @UseGuards(AuthGuard)
  @Patch()
  async update(@Body() updateUserDto: UpdateUserDto,@Req() req:Request ,@Res() res:Response) {
    try { 
      const user = await this.usersService.update(req['user'].id,updateUserDto)
      return sendResponse(res,httpStatusCodes.OK,"success","Update User",user)
    } catch (error) {
      throw new BadRequestException("Error in Update User",error.message);
    }
  }
  @UseGuards(AuthGuard)
  @Delete()
  async remove(@Req() req:Request ,@Res() res:Response) {
    try {
      console.log(req['user']);
      const data = await this.usersService.remove(req['user'].id)
      return sendResponse(res,httpStatusCodes.OK,"success","Delete User",{deletedUser:data})
    } catch (error) {
      throw new BadRequestException("Error in delete User",error.message)
    }
  }
}
