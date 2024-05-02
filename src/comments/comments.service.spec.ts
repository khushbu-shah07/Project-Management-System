import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { create } from 'domain';
import { HttpException, Delete } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

describe('CommentsService', () => {
  let service: CommentsService;

  const comment={
    id:1,
    emp_id:{
      id:1,
    },
    task_id:{
      id:4,
    },
    content:"This is a comment.",
    edited:false,
    created_at:new Date(),
    updated_at:new Date(),
  };

  const mockCommentRepository={
    find:jest.fn().mockResolvedValue([comment]),
    exists:jest.fn().mockResolvedValue(true),
    create:jest.fn().mockResolvedValue(comment),
    save:jest.fn().mockResolvedValue(comment),
    update:jest.fn().mockResolvedValue({affected:1}),
    delete:jest.fn().mockResolvedValue({affected:1}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide:getRepositoryToken(Comment),
          useValue:mockCommentRepository,
        }
      ],
    })
    .compile();  

    service = module.get<CommentsService>(CommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterEach(async()=>{
    jest.clearAllMocks();
  })

  describe('findAll',()=>{
    it('should return list of all comments.',async()=>{
      const result=await service.findAll();
      
      // expect(result).rejects.not.toThrow();
      expect(result).toEqual([comment]);
      expect(mockCommentRepository.find).toHaveBeenCalledWith({
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

    })

    it('should throw error on server error.',async()=>{
      mockCommentRepository.find.mockRejectedValueOnce({message:'Server error',status:400});

      await expect(service.findAll()).rejects.toMatchObject({message:'Server error',status:400})
      
      expect(mockCommentRepository.find).toHaveBeenCalledWith({
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

    })
  })

  describe('find',()=>{
    it('should return list of comments.',async()=>{
      const options={
        id:1,
      }

      const result=await service.find(options);
      
      expect(result).toEqual([comment]);
      expect(mockCommentRepository.find).toHaveBeenCalledWith({where:options});

    })

    it('should throw error on server error.',async()=>{
      const options={
        id:1,
      }

      mockCommentRepository.find.mockRejectedValueOnce({message:'Server error',status:400});

      await expect(service.find(options)).rejects.toMatchObject({message:'Server error',status:400})
      expect(mockCommentRepository.find).toHaveBeenCalledWith({where:options});

    })

  })

  describe('findByEmp',()=>{
    it('should return list of comments by user',async()=>{
      const emp_id=1;

      const result=await service.findByEmp(emp_id);

      expect(result).toEqual([comment]);
      expect(mockCommentRepository.find).toHaveBeenCalledWith({
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

      
    })

    it('should throw error on server error.',async()=>{
      const emp_id=1;

      mockCommentRepository.find.mockRejectedValueOnce({message:'Server error',status:400});

      await expect(service.findByEmp(emp_id)).rejects.toMatchObject({message:'Server error',status:400})
      expect(mockCommentRepository.find).toHaveBeenCalledWith({
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

    })
  })

  describe('findByTask',()=>{
    it('should return list of comments by task',async()=>{
      const task_id=2;

      const result=await service.findByTask(task_id);

      expect(result).toEqual([comment]);
      expect(mockCommentRepository.find).toHaveBeenCalledWith({
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
    })

    it('should throw error on server error.',async()=>{
      const task_id=1;

      mockCommentRepository.find.mockRejectedValueOnce({message:'Server error',status:400});

      await expect(service.findByTask(task_id)).rejects.toMatchObject({message:'Server error',status:400})
      expect(mockCommentRepository.find).toHaveBeenCalledWith({
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

    })
  })

  describe('findByTaskForEmp',()=>{
    it('should return list of comments of given employee',async()=>{
      const task_id=1,emp_id=1;

      const result=await service.findByTaskForEmp(task_id,emp_id);

      expect(result).toEqual([comment]);
      expect(mockCommentRepository.find).toHaveBeenCalledWith({
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

    })

    it('should throw error on server error.',async()=>{
      const emp_id=1,task_id=1;

      mockCommentRepository.find.mockRejectedValueOnce({message:'Server error',status:400});

      await expect(service.findByTaskForEmp(task_id,emp_id)).rejects.toMatchObject({message:'Server error',status:400})
      expect(mockCommentRepository.find).toHaveBeenCalledWith({
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

    })
  })

  describe('findByTaskForPM',()=>{
    it('should return list of all comments for given pm',async()=>{
      const task_id=1,pm_id=1;

      const result=await service.findByTaskForPM(task_id,pm_id);

      expect(result).toEqual([comment]);
      expect(mockCommentRepository.find).toHaveBeenCalledWith({
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
      })
    })

    it('should throw error on server error.',async()=>{
      const task_id=1,pm_id=1;

      mockCommentRepository.find.mockRejectedValueOnce({message:'Server error',status:400});

      await expect(service.findByTaskForPM(task_id,pm_id)).rejects.toMatchObject({message:'Server error',status:400})
      expect(mockCommentRepository.find).toHaveBeenCalledWith({
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

    })
  })

  describe('taskBelongsToPM',()=>{
    it('should return boolean.',async()=>{
      const task_id=1,pm_id=1;

      const result=await service.taskBelongsToPM(task_id,pm_id);
      
      expect(result).toBeTruthy();
      expect(mockCommentRepository.exists).toHaveBeenCalledWith({
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
    })

    it('should throw error on server error.',async()=>{
      const task_id=1,pm_id=1;

      mockCommentRepository.exists.mockRejectedValueOnce({message:'Server error',status:400});

      await expect(service.taskBelongsToPM(task_id,pm_id)).rejects.toMatchObject({message:'Server error',status:400})
      expect(mockCommentRepository.exists).toHaveBeenCalledWith({
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

    })
  })

  describe('create',()=>{
    it('should create comment.',async()=>{
      const emp_id=1;
      const createCommentDto:CreateCommentDto={
        task_id:1,
        content:'This is a comment.',
      };

      const mockComment={
        id:2,
        emp_id:{
          id:emp_id
        },
        task_id:{
          id:1,
        },
        content:'This is a comment.',
        edited:false,
        created_at:new Date(),
        updated_at:new Date(),
      }

      mockCommentRepository.create.mockResolvedValueOnce(mockComment);
      mockCommentRepository.save.mockResolvedValueOnce(mockComment);

      const result=await service.create(emp_id,createCommentDto);

      expect(result).toEqual(mockComment);
      expect(mockCommentRepository.create).toHaveBeenCalledWith({emp_id,...createCommentDto});
      expect(mockCommentRepository.save).toHaveBeenCalledWith(mockComment);
    })

    it('should throw error on server error.',async()=>{
      const emp_id=1;
      const createCommentDto:CreateCommentDto={
        task_id:1,
        content:'This is a comment.',
      };

      const mockComment={
        id:2,
        emp_id:{
          id:emp_id
        },
        task_id:{
          id:1,
        },
        content:'This is a comment.',
        edited:false,
        created_at:new Date(),
        updated_at:new Date(),
      }

      mockCommentRepository.create.mockResolvedValueOnce(mockComment);
      mockCommentRepository.save.mockRejectedValueOnce({message:'Server error',status:400});

      await expect(service.create(emp_id,createCommentDto)).rejects.toMatchObject({message:'Server error',status:400});

      expect(mockCommentRepository.create).toHaveBeenCalledWith({emp_id,...createCommentDto});
      expect(mockCommentRepository.save).toHaveBeenCalledWith(mockComment);
    })
  })

  describe('update',()=>{
    it('should update comment and return number of affected rows.',async()=>{
      const id=1;
      const updateCommentDto:UpdateCommentDto={
        content:'updated comment.'
      }

      const mockComment={
        id,
        emp_id:{
          id:1
        },
        task_id:{
          id:1,
        },
        content:'This is a comment.',
        edited:true,
        created_at:new Date(),
        updated_at:new Date(),
      }

      const result=await service.update(id,updateCommentDto);

      expect(result).toEqual(1);
      expect(mockCommentRepository.update).toHaveBeenCalledWith(
        { id },
        { edited: true, ...updateCommentDto },
      );

    })

    it('should throw error on server error.',async()=>{
      const id=1;
      const updateCommentDto:UpdateCommentDto={
        content:'updated comment.'
      }

      const mockComment={
        id,
        emp_id:{
          id:1
        },
        task_id:{
          id:1,
        },
        content:'This is a comment.',
        edited:true,
        created_at:new Date(),
        updated_at:new Date(),
      }

      mockCommentRepository.update.mockRejectedValueOnce({message:'Server error',status:400});

      await expect(service.update(id,updateCommentDto)).rejects.toMatchObject({message:'Server error',status:400});

      expect(mockCommentRepository.update).toHaveBeenCalledWith(
        { id },
        { edited: true, ...updateCommentDto },
      );

    })
  })

  describe('updateWithEmpId',()=>{
    it('should update comment and return number of affected rows.',async()=>{
      const id=1,emp_id=1;
      const updateCommentDto:UpdateCommentDto={
        content:'updated comment.'
      }

      const result=await service.updateWithEmpId(id,emp_id,updateCommentDto);

      expect(result).toEqual(1);
      expect(mockCommentRepository.update).toHaveBeenCalledWith(
        { id, emp_id: { id: emp_id } },
        { edited: true, ...updateCommentDto },
      );

    })

    it('should throw error on server error.',async()=>{
      const id=1,emp_id=1;
      const updateCommentDto:UpdateCommentDto={
        content:'updated comment.'
      }

      mockCommentRepository.update.mockRejectedValueOnce({message:'Server error',status:400});

      await expect(service.updateWithEmpId(id,emp_id,updateCommentDto)).rejects.toMatchObject({message:'Server error',status:400});

      expect(mockCommentRepository.update).toHaveBeenCalledWith(
        { id, emp_id: { id: emp_id } },
        { edited: true, ...updateCommentDto },
      );

    })
  })

  describe('remove',()=>{
    it('should remove comment from the database and return number of affected rows.',async()=>{
      const id=1,emp_id=1;

      const result=await service.remove(id,emp_id);

      expect(result).toEqual(1);
      expect(mockCommentRepository.delete).toHaveBeenCalledWith({id:id,emp_id:emp_id});
    })

    it('should throw error on server error.',async()=>{
      const id=1,emp_id=1;

      mockCommentRepository.delete.mockRejectedValueOnce({message:'Server error',status:400});
      await expect(service.remove(id,emp_id)).rejects.toMatchObject({message:'Server error',status:400});

      expect(mockCommentRepository.delete).toHaveBeenCalledWith({id:id,emp_id:emp_id});
    })
  })

});
