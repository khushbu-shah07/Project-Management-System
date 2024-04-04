import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TimeTrackingService } from './time-tracking.service';
import { CreateTimeTrackingDto } from './dto/create-time-tracking.dto';
import { UpdateTimeTrackingDto } from './dto/update-time-tracking.dto';

@Controller('time-tracking')
export class TimeTrackingController {
  constructor(private readonly timeTrackingService: TimeTrackingService) {}

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
    return this.timeTrackingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTimeTrackingDto: UpdateTimeTrackingDto) {
    return this.timeTrackingService.update(+id, updateTimeTrackingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.timeTrackingService.remove(+id);
  }
}
