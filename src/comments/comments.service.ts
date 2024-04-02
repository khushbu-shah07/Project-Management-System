import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CommentsService {
  constructor(@InjectRepository(Comment) private readonly commentRepository:Repository<Comment>){};

  findAll() {
    return `This action returns all comments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  async find(options){
    try{
      return this.commentRepository.find({where:options});
    }
    catch(err){
      throw err;
    }
  }

  async findByTask(task_id:number){
    try{
      return this.commentRepository.find({where:{task_id:task_id}});
    }
    catch(err){
      return err;
    }
  }
  
  async findByEmp(emp_id:number){
    try{
      return this.commentRepository.find(where:{emp_id:emp_id});
    }
    catch(err){
      throw err;
    }
  }
  
  async create(emp_id:number,createCommentDto: CreateCommentDto):Promise<Comment> {
    try{
      const comment=await this.commentRepository.create({emp_id,...CreateCommentDto});
      await this.commentRepository.save(comment);

      return comment;
    }
    catch(err){
      throw err;
    }
  }

  async update(id:number,updateCommentDto:UpdateCommentDto){
    try{
      const {affected} = await this.commentRepository.update({id},updateCommentDto);
      return affected;
    }
    catch(err){
      throw err;
    }
  }

  async updateWithEmpId(id: number,emp_id:number, updateCommentDto: UpdateCommentDto) {
    try{
      const {affected}=await this.commentRepository.update({id,emp_id},updateCommentDto);
      return affected;
    }
    catch(err){
      return err;
    }
  }

  async remove(id: number) {
    try{
      const {affected} = await this.commentRepository.delete({id});
      return affected;
    }
    catch(err){
      throw err;
    }
  }

}
