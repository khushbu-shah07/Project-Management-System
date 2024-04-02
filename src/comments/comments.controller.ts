import { Request } from 'express';
import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, NotFoundException, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { httpStatusCodes, sendResponse } from 'utils/sendresponse';
import { AuthGuard } from 'src/auth/Guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  async findAll(@Req() req, @Res() res) {
    console.log(req.user)
    try{
      const result = await this.commentsService.find({});
      sendResponse(res,httpStatusCodes.OK,'Ok','Get all comments',result);
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto,@Req() req,@Res() res) {
    console.log("U",updateCommentDto)
    let affected=await this.commentsService.updateWithEmpId(+id,req.user.id,updateCommentDto);
    if(affected===0){
      throw new NotFoundException("Comment not found or Comment belongs to other user.");
    }

    sendResponse(res,httpStatusCodes.OK,'ok','Comment update',null)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentsService.remove(+id);
  }
}
