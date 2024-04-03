import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { TaskService } from 'src/task/task.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>) {}

  async findAll():Promise<Comment[]> {
    try {
      return this.commentRepository.find({
        relations: ['emp_id', 'task_id'],
        select: {
          emp_id: {
            id: true,
          },
          task_id: {
            id: true,
          },
        },
        order: {
          created_at: 'ASC',
        },
      });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async find(options):Promise<Comment[]> {
    try {
      return this.commentRepository.find({ where: options });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async findByEmp(emp_id: number):Promise<Comment[]> {
    try {
      return this.commentRepository.find({
        where:{emp_id:{id:emp_id}} as unknown,
        relations:['task_id','emp_id'],
        select:{
          task_id:{
            id:true,
          },
          emp_id:{
            id:true,
          }
        },
        order:{
          created_at:'ASC',
        }
        
      });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async findByTask(task_id: number):Promise<Comment[]> {
    try {
      return this.commentRepository.find({
        where: { task_id: task_id } as unknown,
        relations: ['task_id', 'emp_id'],
        select: {
          task_id: {
            id: true,
          },
          emp_id: {
            id: true,
          },
        },
        order: {
          created_at: 'ASC',
        },
      });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async findByTaskForEmp(task_id: number, emp_id: number):Promise<Comment[]> {
    try {
      const result = await this.commentRepository.find({
        where: {
          'task_id.id': task_id,
          'emp_id.id': emp_id,
        } as unknown,
        relations: ['emp_id', 'task_id'],
        select: {
          emp_id: {
            id: true,
          },
          task_id: {
            id: true,
          },
        },
        order: {
          created_at: 'ASC',
        },
      });

      return result;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async findByTaskForPM(task_id: number, pm_id: number):Promise<Comment[]> {
    try {
      const result = await this.commentRepository.find({
        where: {
          task_id: {
            id: task_id,
            project_id: {
              pm_id: pm_id,
            },
          },
        } as unknown,
        relations: [
          'emp_id',
          'task_id',
          'task_id.project_id',
          'task_id.project_id.pm_id',
        ],
        select: {
          id: true,
          content: true,
          edited: true,
          created_at: true,
          updated_at: true,
          task_id: {
            id: true,
            project_id: {
              id: false,
            },
          },
          emp_id: {
            id: true,
          },
        },
        order: {
          created_at: 'ASC',
        },
      });

      return result;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async taskBelongsToPM(task_id: number, pm_id: number):Promise<boolean> {
    try {
      return await this.commentRepository.exists({
        where: {
          task_id: {
            id: task_id,
            project_id: {
              pm_id: {
                id: pm_id,
              },
            },
          },
        },
        relations: [
          'emp_id',
          'task_id',
          'task_id.project_id',
          'task_id.project_id.pm_id',
        ],
      });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async create(emp_id: number, createCommentDto: CreateCommentDto):Promise<Comment> {
    try {
      const comment = await this.commentRepository.create({
        emp_id: emp_id,
        ...createCommentDto,
      } as unknown as Comment);
      await this.commentRepository.save(comment);

      return comment;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async update(id: number, updateCommentDto: UpdateCommentDto):Promise<number> {
    try {
      const { affected } = await this.commentRepository.update(
        { id },
        { edited: true, ...updateCommentDto },
      );
      return affected;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async updateWithEmpId(id: number,emp_id: number,updateCommentDto: UpdateCommentDto):Promise<number> {
    try {
      const result = await this.commentRepository.update(
        { id, emp_id: { id: emp_id } },
        { edited: true, ...updateCommentDto },
      );
      return result.affected;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async remove(id: number):Promise<number> {
    try {
      const { affected } = await this.commentRepository.delete({ id });
      return affected;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
