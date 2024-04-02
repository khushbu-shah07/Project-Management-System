import { BadRequestException, Injectable } from '@nestjs/common';
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
      throw new BadRequestException(err.message)
    }
  }

  async findByTask(task_id:number){
    try{
      return this.commentRepository.find({where:{task_id:task_id} as unknown});
    }
    catch(err){
      throw new BadRequestException(err.message)
    }
  }
  
  async findByEmp(emp_id:number){
    try{
      const result = await this.commentRepository.find({relations:['emp_id'],where:{
        emp_id:{
          id:emp_id
        }
      }});

      console.log(result)
      
      return result;
    }
    catch(err){
      throw new BadRequestException(err.message)
    }
  }
  
  async create(emp_id:number,createCommentDto: CreateCommentDto) {
    try{
      const comment=await this.commentRepository.create({emp_id:emp_id,...createCommentDto} as unknown as Comment);
      await this.commentRepository.save(comment);

      return comment;
    }
    catch(err){
      console.log("EE",err.message)
      throw new BadRequestException(err.message)
    }
  }

  async update(id:number,updateCommentDto:UpdateCommentDto){
    try{
      const {affected} = await this.commentRepository.update({id},{edited:true,...updateCommentDto});
      return affected;
    }
    catch(err){
      throw new BadRequestException(err.message)
    }
  }

  async updateWithEmpId(id: number,emp_id:number, updateCommentDto: UpdateCommentDto) {
    try{
      const result=await this.commentRepository.update({id,emp_id:{id:emp_id}},{edited:true,...updateCommentDto});
      return result.affected;
    }
    catch(err){
      throw new BadRequestException(err.message)
    }
  }

  async remove(id: number) {
    try{
      const {affected} = await this.commentRepository.delete({id});
      return affected;
    }
    catch(err){
      throw new BadRequestException(err.message)
    }
  }

}
