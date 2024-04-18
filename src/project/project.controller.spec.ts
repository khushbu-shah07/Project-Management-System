import { Test, TestingModule } from '@nestjs/testing';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { UsersModule } from '../users/users.module';
import { dataSourceOptions } from '../../db/data-source';
import { AuthModule } from '../auth/auth.module';

describe('ProjectController', () => {
  let controller: ProjectController;
  let service: ProjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(dataSourceOptions), TypeOrmModule.forFeature([Project]), UsersModule, AuthModule],
      controllers: [ProjectController],
      providers: [ProjectService],
    }).compile();

    controller = module.get<ProjectController>(ProjectController);
    service = module.get<ProjectService>(ProjectService);
  });

  describe('findAll', () => {
    it('should return an array of projects', async () => {
      let result;
      const testResult = [{
        name : "egknekg",
        age: 21        
      }];

      jest.spyOn(service, 'findAll').mockImplementation(async () => result);
      // expect(await controller.findAll()).toEqual(result);
    })
  })
});
