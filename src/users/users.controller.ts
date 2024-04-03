import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, BadRequestException, UseGuards, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request, Response } from 'express';
import { httpStatusCodes, sendResponse } from "../../utils/sendresponse";
import { AuthGuard } from 'src/auth/Guards/auth.guard';
import { AdminGuard } from '../auth/Guards/admin.guard';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Req() req: Request, @Res() res: Response) {
    try {
      const user = await this.usersService.create(createUserDto)
      return sendResponse(res, httpStatusCodes.Created, "success", "Create User", user)
    } catch (error) {
      throw new BadRequestException("Error in create User", error.message)
    }
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Get()
  async findAll(@Req() req: Request, @Res() res: Response) {
    try {
      const users = await this.usersService.findAll()
      return sendResponse(res, httpStatusCodes.OK, "success", "Get All User", users)
    } catch (error) {
      throw new BadRequestException("Error in FindAll User", error.message)
    }
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    try {
      const user = await this.usersService.findOne(+id)
      if (req['user'].role !== 'admin') {
        if (req['user'].id !== +id) {
          throw new Error("Access Denied to Fetch Single User")
        }
      }
      return sendResponse(res, httpStatusCodes.OK, "success", "Get Single User", user)
    } catch (error) {
      throw new BadRequestException("Error in Get Single User", error.message)
    }
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: Request, @Res() res: Response) {
    try {
      let data: User
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
      throw new BadRequestException("Error in Update User", error.message);
    }
  }
  @UseGuards(AuthGuard)
  @Delete(":id")
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
      throw new BadRequestException("Error in delete User", error.message)
    }
  }
}
