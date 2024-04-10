import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';

const mockProjectRepository = {
  find: jest.fn()
}

describe('ProjectService', () => {
  let service: ProjectService;
  let projectRepository: Repository<Project>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
      providers: [
        ProjectService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectRepository
        }
      ]
    }).compile()

    service = module.get<ProjectService>(ProjectService);
    projectRepository = module.get(getRepositoryToken(Project));

    mockProjectRepository.find.mockClear()
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an array of projects', async () => {
    const testProjects = [

    ]

    mockProjectRepository.find.mockResolvedValue(testProjects);

    const result = await service.findAll()
    expect(result).toEqual(testProjects);
    expect(mockProjectRepository.find).toBeCalledTimes(1);
  })
});
