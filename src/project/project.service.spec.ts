import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { UsersService } from '../users/users.service';
import { HttpException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';

describe('<-- ProjectService -->', () => {
  let service: ProjectService;
  let mockProjectRepository;
  let mockUserService;

  beforeEach(async () => {
    mockProjectRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn()
    };

    mockUserService = {
      findOne: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectRepository,
        },
        {
          provide: UsersService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
  });

  describe('findOne', () => {
    it('should return a project if it exists', async () => {
      const projectId = 1;
      const expectedProject = {
        id: projectId,
        name: 'Test Project'
      }
      mockProjectRepository.findOne.mockResolvedValue(expectedProject);

      const result = await service.findOne(projectId);
      expect(result).toEqual(expectedProject);
      expect(mockProjectRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: projectId
        }
      });
    });

    it('should throw a httpException if no project is found', async () => {
      const projectId = 1;
      mockProjectRepository.findOne.mockResolvedValue(undefined);

      await expect(service.findOne(projectId)).rejects.toThrow(HttpException);
      expect(mockProjectRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: projectId
        }
      });
    });

    it('should handle database errors', async () => {
      const projectId = 1;
      const error = new Error('Database connection error');
      mockProjectRepository.findOne.mockRejectedValue(error);

      await expect(service.findOne(projectId)).rejects.toThrow(error);
      expect(mockProjectRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: projectId
        }
      });
    });
  });

  describe('create', () => {
    it('should create a project', async () => {
      const projectData = {
        "name": "Test Project",
        "description": "Project Description",
        "startDate": "2024-12-12",
        "expectedEndDate": "2024-12-15",
        "clientEmail": "client@gmail.com",
        "pm_id": 1
      }

      const expectedUser = {
        id: 1,
        name: 'Test user'
      }

      const expectedResult = { ...projectData, pm_id: expectedUser }

      mockUserService.findOne.mockResolvedValue(expectedUser);
      mockProjectRepository.create.mockResolvedValue(expectedResult);

      const result = await service.create(projectData as unknown as CreateProjectDto)
      expect(result).toEqual(expectedResult);
      expect(mockUserService.findOne).toHaveBeenCalledWith(projectData.pm_id)
      expect(mockProjectRepository.create).toHaveBeenCalledWith({ ...projectData, pm_id: expectedUser })
      expect(mockProjectRepository.save).toHaveBeenCalledWith({ ...projectData, pm_id: expectedUser })
    })

    it('should handle database errors occurred while creating a project', async () => {
      const projectData = {
        "name": "Test Project",
        "description": "Project Description",
        "startDate": "2024-12-12",
        "expectedEndDate": "2024-12-15",
        "clientEmail": "client@gmail.com",
        "pm_id": 1
      }

      const expectedUser = {
        id: 1,
        name: 'Test user'
      }
      const error = new Error('Database connection error');

      mockUserService.findOne.mockResolvedValue(expectedUser);
      mockProjectRepository.create.mockRejectedValue(error);

      await expect(service.create(projectData as unknown as CreateProjectDto)).rejects.toThrow(HttpException);
      expect(mockUserService.findOne).toHaveBeenCalledWith(projectData.pm_id)
      expect(mockProjectRepository.create).toHaveBeenCalledWith({ ...projectData, pm_id: expectedUser })
      expect(mockProjectRepository.save).not.toHaveBeenCalled()
    })

    it('should handle database errors occurred while finding the user(pm)', async () => {
      const projectData = {
        "name": "Test Project",
        "description": "Project Description",
        "startDate": "2024-12-12",
        "expectedEndDate": "2024-12-15",
        "clientEmail": "client@gmail.com",
        "pm_id": 1
      }

      const expectedUser = {
        id: 1,
        name: 'Test user'
      }
      const error = new Error('Database connection error');

      mockUserService.findOne.mockRejectedValue(error);

      await expect(service.create(projectData as unknown as CreateProjectDto)).rejects.toThrow(HttpException);
      expect(mockUserService.findOne).toHaveBeenCalledWith(projectData.pm_id)
      expect(mockProjectRepository.create).not.toHaveBeenCalled()
      expect(mockProjectRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('findAll', () => {
    it('should return all the projects', async () => {
      const expectedResult = [
        {
          id: 1,
          name: 'Test project 1'
        },
        {
          id: 2,
          name: 'Test project 2'
        },
        {
          id: 3,
          name: 'Test project 3'
        }
      ]

      mockProjectRepository.find.mockResolvedValue(expectedResult);

      const result = await service.findAll();
      expect(result).toEqual(expectedResult);
      expect(mockProjectRepository.find).toHaveBeenCalled()
    })

    it('should handle database errors', async () => {
      const error = new Error('Database connection error');
      mockProjectRepository.find.mockRejectedValue(error);

      await expect(service.findAll()).rejects.toThrow(HttpException);
      expect(mockProjectRepository.find).toHaveBeenCalled()
    })
  })

  describe('update', () => {
    it('should update the project', async () => {
      const projectId = 1;
      const dataToUpdate = {
        name: 'Test project name update',
        description: 'Test project description update'
      }
      const expectedResult = {
        affected: 1
      }

      mockProjectRepository.update.mockResolvedValue(expectedResult);

      await service.update(projectId, dataToUpdate);
      expect(mockProjectRepository.update).toHaveBeenCalledWith({ id: projectId }, dataToUpdate);
    })

    it('should throw httpExpection if project does not exits', async () => {
      const projectId = 1;
      const dataToUpdate = {
        name: 'Test project name update',
        description: 'Test project description update'
      }
      const expectedResult = {
        affected: 0
      }

      mockProjectRepository.update.mockResolvedValue(expectedResult);

      await expect(service.update(projectId, dataToUpdate)).rejects.toThrow(HttpException)
      expect(mockProjectRepository.update).toHaveBeenCalledWith({ id: projectId }, dataToUpdate);
    })

    it('should handle database errors', async () => {
      const projectId = 1;
      const dataToUpdate = {
        name: 'Test project name update',
        description: 'Test project description update'
      }
      const error = new Error('Database connection error');

      mockProjectRepository.update.mockRejectedValue(error);

      await expect(service.update(projectId, dataToUpdate)).rejects.toThrow(HttpException);
      expect(mockProjectRepository.update).toHaveBeenCalledWith({ id: projectId }, dataToUpdate);
    })
  })

  describe('remove', () => {
    it('should delete the project', async () => {
      const projectId = 1;

      const expectedResult = {
        affected: 1
      }

      mockProjectRepository.softDelete.mockResolvedValue(expectedResult);

      await service.remove(projectId);
      expect(mockProjectRepository.softDelete).toHaveBeenCalledWith({ id: projectId });
    })

    it('should throw httpExpection if project does not exits', async () => {
      const projectId = 1;
      const expectedResult = {
        affected: 0
      }

      mockProjectRepository.softDelete.mockResolvedValue(expectedResult);

      await expect(service.remove(projectId)).rejects.toThrow(HttpException)
      expect(mockProjectRepository.softDelete).toHaveBeenCalledWith({ id: projectId });
    })

    it('should handle database errors', async () => {
      const projectId = 1;
      const error = new Error('Database connection error');

      mockProjectRepository.softDelete.mockRejectedValue(error);

      await expect(service.remove(projectId)).rejects.toThrow(HttpException);
      expect(mockProjectRepository.softDelete).toHaveBeenCalledWith({ id: projectId });
    })
  })

  describe('complete project', () => {
    it('should the project status to completed', async () => {
      const projectId = 1;
      const d = new Date().toISOString()

      const expectedResult = {
        affected: 1
      }

      mockProjectRepository.update.mockResolvedValue(expectedResult);

      await service.completeProject(projectId);
      expect(mockProjectRepository.update).toHaveBeenCalledWith(projectId, {status: 'completed', actualEndDate: d});
    })

    it('should throw httpExpection if project does not exits', async () => {
      const projectId = 1;
      const d = new Date().toISOString()
      const expectedResult = {
        affected: 0
      }

      mockProjectRepository.update.mockResolvedValue(expectedResult);

      await expect(service.completeProject(projectId)).rejects.toThrow(HttpException)
      expect(mockProjectRepository.update).toHaveBeenCalledWith(projectId, {status: 'completed', actualEndDate: d});
    })

    it('should handle database errors', async () => {
      const projectId = 1;
      const d = new Date().toISOString()
      const error = new Error('Database connection error');
      

      mockProjectRepository.update.mockRejectedValue(error);

      await expect(service.completeProject(projectId)).rejects.toThrow(HttpException);
      expect(mockProjectRepository.update).toHaveBeenCalledWith(projectId, {status: 'completed', actualEndDate: d});
    })
  })
});
