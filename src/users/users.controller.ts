import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request, Response } from 'express';
import { httpStatusCodes,sendResponse } from './utils/sendresponse';

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

  @Get()
  async findAll(@Req() req:Request ,@Res() res:Response) {
    try {
      const users = await this.usersService.findAll()
      return sendResponse(res,httpStatusCodes.Created,"success","Create User",users)
    } catch (error) {
      throw new BadRequestException("Error in FindAll User",error.message)
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
