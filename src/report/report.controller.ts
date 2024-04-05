import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, Req, Res, ForbiddenException } from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { httpStatusCodes, sendResponse } from 'utils/sendresponse';
import { Request, Response } from 'express';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) { }

  // @Post()
  // create(@Body() createReportDto: CreateReportDto) {
  //   return this.reportService.create(createReportDto);
  // }

  // @Get()
  // findAll() {
  //   return this.reportService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.reportService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
  //   return this.reportService.update(+id, updateReportDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.reportService.remove(+id);
  // }

  @Get(':id')
  async generateProjectReport(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      // throw new ForbiddenException("Acess denied")
      const projectReport = await this.reportService.generateReport(+id);

      return sendResponse(
        res,
        httpStatusCodes.OK,
        'success',
        'Generate Project Report',
        projectReport
      )
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }
}
