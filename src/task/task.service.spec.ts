import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Project } from '../../src/project/entities/project.entity';
import { TaskUser } from './entities/task-user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { HttpException } from '@nestjs/common';

describe('<-- TaskService -->', () => {
  let service: TaskService;
  let mockTaskRepository;
  let mockTaskUserRepository;
  let mockProjectRepository;

  beforeEach(async () => {

    mockTaskRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      createQueryBuilder: jest.fn(),
      exists: jest.fn()
    }

    mockTaskUserRepository = {
      createQueryBuilder: jest.fn(),
      create: jest.fn(),
      save: jest.fn()
    }

    mockProjectRepository = {
      update: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository
        },
        {
          provide: getRepositoryToken(TaskUser),
          useValue: mockTaskUserRepository
        },
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectRepository
        }
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a task', async () => {
      const taskData = {
        "title": "task_title_1",
        "description": "task_desc_1",
        "startDate": "2024-12-12",
        "expectedEndDate": "2024-12-15",
        "project_id": 3
      }

      const expectedResult = {
        ...taskData,
        project_id: {
          id: 3,
          name: 'Test project'
        }
      }

      mockTaskRepository.create.mockResolvedValue(expectedResult);

      const result = await service.create(taskData as unknown as CreateTaskDto);
      expect(result).toEqual(expectedResult);
      expect(mockTaskRepository.create).toHaveBeenCalledWith(taskData);
      expect(mockTaskRepository.save).toHaveBeenCalledWith(expectedResult);
    })

    it('should handle database errors', async () => {
      const taskData = {
        "title": "task_title_1",
        "description": "task_desc_1",
        "startDate": "2024-12-12",
        "expectedEndDate": "2024-12-15",
        "project_id": 3
      }

      const error = new Error('Database connetion error');
      mockTaskRepository.create.mockRejectedValue(error);

      await expect(service.create(taskData as unknown as CreateTaskDto)).rejects.toThrow(HttpException);
      expect(mockTaskRepository.create).toHaveBeenCalledWith(taskData);
      expect(mockTaskRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('findAll', () => {
    it('should return all tasks', async () => {
      const expectedResult = [
        {
          id: 1,
          title: 'test task 1'
        },
        {
          id: 2,
          title: 'test task 2'
        },
        {
          id: 3,
          title: 'test task 3'
        }
      ]

      mockTaskRepository.find.mockResolvedValue(expectedResult);

      const result = await service.findAll();
      expect(result).toEqual(expectedResult);
      expect(mockTaskRepository.find).toHaveBeenCalled()
    })

    it('should handle database errors', async () => {
      const error = new Error('Database connection error');
      mockTaskRepository.find.mockRejectedValue(error);

      await expect(service.findAll()).rejects.toThrow(HttpException);
      expect(mockTaskRepository.find).toHaveBeenCalled();
    })
  })

  describe('findOne', () => {
    it('should return the task if exists', async () => {
      const taskId = 1;
      const expecetedResult = {
        id: 1,
        title: 'test task'
      }

      mockTaskRepository.findOne.mockResolvedValue(expecetedResult);

      const result = await service.findOne(taskId);
      expect(result).toEqual(expecetedResult);
      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
        select: {
          project_id: {
            id: true,
            pm_id: {
              id: true,
            }
          }
        },
        relations: ['project_id', 'project_id.pm_id']
      });
    })

    it('should throw an httpException if task does not exists', async () => {
      const taskId = 1;

      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(taskId)).rejects.toThrow(HttpException);
      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
        select: {
          project_id: {
            id: true,
            pm_id: {
              id: true,
            }
          }
        },
        relations: ['project_id', 'project_id.pm_id']
      });
    })

    it('should handle database errors', async () => {
      const taskId = 1;
      const error = new Error('Database connection error');

      mockTaskRepository.findOne.mockRejectedValue(error);
      await expect(service.findOne(taskId)).rejects.toThrow(HttpException);
      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
        select: {
          project_id: {
            id: true,
            pm_id: {
              id: true,
            }
          }
        },
        relations: ['project_id', 'project_id.pm_id']
      });
    })
  })

  describe('update', () => {
    it('should update the task', async () => {
      const taskId = 1;
      const dataToUpdate = {
        title: 'Test task'
      }

      const expectedResult = {
        affected: 1
      }

      mockTaskRepository.update.mockResolvedValue(expectedResult);

      const result = await service.update(taskId, dataToUpdate);
      expect(result).toEqual(expectedResult.affected);
      expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, dataToUpdate);
    })

    it('should throw httpException if task does not exsits', async () => {
      const taskId = 1;
      const dataToUpdate = {
        title: 'Test task'
      }

      const expectedResult = {
        affected: 0
      }

      mockTaskRepository.update.mockResolvedValue(expectedResult);

      await expect(service.update(taskId, dataToUpdate)).rejects.toThrow(HttpException);
      expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, dataToUpdate);
    })

    it('should handle database errors', async () => {
      const taskId = 1;
      const dataToUpdate = {
        title: 'Test task'
      }

      const error = new Error('Database connection error');
      mockTaskRepository.update.mockRejectedValue(error);

      await expect(service.update(taskId, dataToUpdate)).rejects.toThrow(HttpException);
      expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, dataToUpdate);
    })
  })

  describe('remove', () => {
    it('should delete the task if exists', async () => {
      const taskId = 1;
      const expectedResult = { affected: 1 }

      mockTaskRepository.softDelete.mockResolvedValue(expectedResult);

      const result = await service.remove(taskId);
      expect(result).toEqual(expectedResult.affected);
      expect(mockTaskRepository.softDelete).toHaveBeenCalledWith(taskId);
    })

    it('should throw httpException if task does not exists', async () => {
      const taskId = 1;
      const expectedResult = { affected: 0 }

      mockTaskRepository.softDelete.mockResolvedValue(expectedResult);

      await expect(service.remove(taskId)).rejects.toThrow(HttpException);
      expect(mockTaskRepository.softDelete).toHaveBeenCalledWith(taskId);
    })

    it('should handle database errors', async () => {
      const taskId = 1;
      const error = new Error('Database connection error');

      mockTaskRepository.softDelete.mockRejectedValue(error);

      await expect(service.remove(taskId)).rejects.toThrow(HttpException);
      expect(mockTaskRepository.softDelete).toHaveBeenCalledWith(taskId);
    })
  })

  describe('findTaskUser', () => {
    it('should return the count of task user', async () => {
      const taskId = 1;
      const userId = 5;
      const count = 1;

      mockTaskUserRepository.createQueryBuilder.mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValueOnce(count),
      });

      const result = await service.findTaskUser(taskId, userId);
      expect(result).toEqual(count);
      expect(mockTaskUserRepository.createQueryBuilder).toHaveBeenCalled()
    })

    it('should handle database errors', async () => {
      const taskId = 1;
      const userId = 5;
      const error = new Error('Database connection error');

      mockTaskUserRepository.createQueryBuilder.mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockRejectedValue(error),
      });

      await expect(service.findTaskUser(taskId, userId)).rejects.toThrow(HttpException);
      expect(mockTaskUserRepository.createQueryBuilder).toHaveBeenCalled()
    })
  })

  describe('findTaskUserRow', () => {
    it('should return task user', async () => {
      const taskId = 1;
      const userId = 5;
      const expectedResult = {
        task_id: {
          id: 1,
          title: 'test task'
        },
        user_id: {
          id: 5,
          name: 'test user'
        }
      }

      mockTaskUserRepository.createQueryBuilder.mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValueOnce(expectedResult),
      });

      const result = await service.findTaskUserRow(taskId, userId);
      expect(result).toEqual(expectedResult);
      expect(mockTaskUserRepository.createQueryBuilder).toHaveBeenCalled()
    })

    it('should handle database errors', async () => {
      const taskId = 1;
      const userId = 5;
      const error = new Error('Database connection error');

      mockTaskUserRepository.createQueryBuilder.mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockRejectedValue(error),
      });

      await expect(service.findTaskUser(taskId, userId)).rejects.toThrow(HttpException);
      expect(mockTaskUserRepository.createQueryBuilder).toHaveBeenCalled()
    })
  })
});
