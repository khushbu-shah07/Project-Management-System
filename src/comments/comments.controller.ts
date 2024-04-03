import { Request } from 'express';
import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, NotFoundException, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { httpStatusCodes, sendResponse } from 'utils/sendresponse';
import { AuthGuard } from 'src/auth/Guards/auth.guard';
import { AdminGuard } from 'src/auth/Guards/admin.guard';

@UseGuards(AuthGuard)
@Controller('/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(AdminGuard)
  @Get()
  async findAll(@Req() req, @Res() res) {
    try{
      const result = await this.commentsService.findAll();
      sendResponse(res,httpStatusCodes.OK,'Ok','Get all comments',result);
    }
    catch(err){
      throw err;
    }
  }

  @Get(':task_id')
  async findOne(@Param('task_id') task_id: string,@Req() req, @Res() res) {
    try{
      let result;
      if(req.user.role==='admin'){
        result=await this.commentsService.findByTask(+task_id);
      }
      else if(req.user.role==='pm'){
        result = await this.commentsService.findByTaskForPM(+task_id,req.user.id);
      }
      else{
        result = await this.commentsService.findByTaskForEmp(+task_id,req.user.id);
      }

      sendResponse(res,httpStatusCodes.OK,'ok','Get comments for a task',result);
    }
    catch(err){
      throw err;
    }

  }

  @Post()
  async create(@Body() createCommentDto: CreateCommentDto,@Req() req, @Res() res) {
    try{
      const comment=await this.commentsService.create(req.user.id,createCommentDto);
      sendResponse(res,httpStatusCodes.Created,'Created','Create comment',comment);
    }
    catch(err){
      throw err;
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto,@Req() req,@Res() res) {
    try{
      let affected=await this.commentsService.updateWithEmpId(+id,req.user.id,updateCommentDto);
      if(!affected){
        throw new NotFoundException("Comment not found or Comment belongs to other user.");
      }
  
      sendResponse(res,httpStatusCodes.OK,'ok','Comment update',null)
    }
    catch(err){
      throw err;
    }
  }
  
}
