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
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { TimeTrackingService } from './time-tracking.service';
import { CreateTimeTrackingDto } from './dto/create-time-tracking.dto';
import { UpdateTimeTrackingDto } from './dto/update-time-tracking.dto';
import { AuthGuard } from 'src/auth/Guards/auth.guard';
import { TaskService } from 'src/task/task.service';
import { httpStatusCodes, sendResponse } from 'utils/sendresponse';
import { Request, Response } from 'express';
import { AdminProjectGuard } from 'src/auth/Guards/adminProject.guard';

@Controller('time-tracking')
export class TimeTrackingController {
  constructor(
    private readonly timeTrackingService: TimeTrackingService,
    private readonly taskService: TaskService,
  ) {}

  @Post()
  create(@Body() createTimeTrackingDto: CreateTimeTrackingDto) {
    return this.timeTrackingService.create(createTimeTrackingDto);
  }

  @Get()
  findAll() {
    return this.timeTrackingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // return this.timeTrackingService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.timeTrackingService.remove(+id);
  }

  @UseGuards(AuthGuard)
  @Patch('/taskHours/:id')
  async update(
    @Param('id') id: number,
    @Body() updateTimeTrackingDto: UpdateTimeTrackingDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const updatedData = await this.timeTrackingService.update(
        id,
        req['user'].id,
        updateTimeTrackingDto,
      );
      console.log(updatedData);

      if (!updatedData) {
        throw new NotFoundException(
          `Time tracking entry with ID "${id}" not found`,
        );
      }
      return sendResponse(
        res,
        httpStatusCodes.OK,
        'success',
        'Updated timetrack details',
        updatedData,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(AuthGuard,AdminProjectGuard)
  @Get('/taskHours/emp/:userId')
  async getUserTimeLogs(
    @Param('userId') userId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    console.log(req['user'].role)
    try {
      const data = await this.timeTrackingService.findOne(userId,req['user'].id);
      return sendResponse(
        res,
        httpStatusCodes.OK,
        'success',
        'Get log hours of user',
        data,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
