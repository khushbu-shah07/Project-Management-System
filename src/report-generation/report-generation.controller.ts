import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, BadRequestException } from '@nestjs/common';
import { ReportGenerationService } from './report-generation.service';
import { CreateReportGenerationDto } from './dto/create-report-generation.dto';
import { UpdateReportGenerationDto } from './dto/update-report-generation.dto';
import { Request, Response } from 'express';
import { httpStatusCodes, sendResponse } from 'utils/sendresponse';

@Controller('/project/report')
export class ReportGenerationController {
  constructor(private readonly reportGenerationService: ReportGenerationService) { }

  @Post()
  create(@Body() createReportGenerationDto: CreateReportGenerationDto) {
    return this.reportGenerationService.create(createReportGenerationDto);
  }

  @Get()
  findAll() {
    return this.reportGenerationService.findAll();
  }

  @Get(':id')
  async generateReport(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    try {
      const data = await this.reportGenerationService.generateReport(+id);
      return sendResponse(res, httpStatusCodes.OK, "success", "Generate Report", data)
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportGenerationDto: UpdateReportGenerationDto) {
    return this.reportGenerationService.update(+id, updateReportGenerationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportGenerationService.remove(+id);
  }
}
