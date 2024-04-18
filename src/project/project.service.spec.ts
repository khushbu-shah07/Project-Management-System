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
      save: jest.fn()
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
});
