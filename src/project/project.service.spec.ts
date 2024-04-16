import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { ProjectController } from './project.controller';
import { Project } from './entities/project.entity';
import { UsersModule } from '../users/users.module';
import { dataSourceOptions } from '../../db/data-source';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';

describe('ProjectService', () => {
  let service: ProjectService;
  let userService:UsersService;
  let projectRepository: Repository<Project>

  beforeEach(async () => {
    service = new ProjectService(
      projectRepository,
      userService
    )
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of projects', async () => {
      const result: any = [
        {
          "id": 2,
          "name": "fenil_project_2",
          "description": "projc desc",
          "startDate": "2024-12-11T18:30:00.000Z",
          "expectedEndDate": "2024-12-14T18:30:00.000Z",
          "actualEndDate": null,
          "status": "created",
          "clientEmail": "client@gmail.com",
          "created_at": "2024-04-03T04:36:39.831Z",
          "updated_at": "2024-04-03T04:36:39.831Z",
          "deleted_at": null,
          "pm_id": {
            "id": 1,
            "name": "Fenil",
            "email": "fenil@gmail.com",
            "role": "pm",
            "created_at": "2024-04-03T04:32:38.718Z",
            "updated_at": "2024-04-03T04:32:38.718Z",
            "deleted_at": null
          }
        },
        {
          "id": 4,
          "name": "derek_project_3",
          "description": "projc desc",
          "startDate": "2024-12-11T18:30:00.000Z",
          "expectedEndDate": "2024-12-14T18:30:00.000Z",
          "actualEndDate": null,
          "status": "created",
          "clientEmail": "client@gmail.com",
          "created_at": "2024-04-03T04:45:27.373Z",
          "updated_at": "2024-04-03T04:45:27.373Z",
          "deleted_at": null,
          "pm_id": {
            "id": 2,
            "name": "Derek",
            "email": "derek@gmail.com",
            "role": "pm",
            "created_at": "2024-04-03T04:32:51.632Z",
            "updated_at": "2024-04-03T04:32:51.632Z",
            "deleted_at": null
          }
        },
        {
          "id": 6,
          "name": "derek_project_1",
          "description": "projc desc",
          "startDate": "2024-12-11T18:30:00.000Z",
          "expectedEndDate": "2024-12-14T18:30:00.000Z",
          "actualEndDate": null,
          "status": "in_progress",
          "clientEmail": "client@gmail.com",
          "created_at": "2024-04-03T04:45:32.280Z",
          "updated_at": "2024-04-03T04:45:32.280Z",
          "deleted_at": null,
          "pm_id": {
            "id": 2,
            "name": "Derek",
            "email": "derek@gmail.com",
            "role": "pm",
            "created_at": "2024-04-03T04:32:51.632Z",
            "updated_at": "2024-04-03T04:32:51.632Z",
            "deleted_at": null
          }
        },
        {
          "id": 5,
          "name": "derek_project_2",
          "description": "projc desc",
          "startDate": "2024-12-11T18:30:00.000Z",
          "expectedEndDate": "2024-12-14T18:30:00.000Z",
          "actualEndDate": "2024-04-04T04:34:56.552Z",
          "status": "created",
          "clientEmail": "client@gmail.com",
          "created_at": "2024-04-03T04:45:31.204Z",
          "updated_at": "2024-04-04T04:34:56.554Z",
          "deleted_at": null,
          "pm_id": {
            "id": 2,
            "name": "Derek",
            "email": "derek@gmail.com",
            "role": "pm",
            "created_at": "2024-04-03T04:32:51.632Z",
            "updated_at": "2024-04-03T04:32:51.632Z",
            "deleted_at": null
          }
        },
        {
          "id": 1,
          "name": "fenil_project_1",
          "description": "projc desc",
          "startDate": "2024-12-11T18:30:00.000Z",
          "expectedEndDate": "2024-12-14T18:30:00.000Z",
          "actualEndDate": "2024-04-04T04:41:12.840Z",
          "status": "completed",
          "clientEmail": "client@gmail.com",
          "created_at": "2024-04-03T04:36:35.185Z",
          "updated_at": "2024-04-04T04:41:12.850Z",
          "deleted_at": null,
          "pm_id": {
            "id": 1,
            "name": "Fenil",
            "email": "fenil@gmail.com",
            "role": "pm",
            "created_at": "2024-04-03T04:32:38.718Z",
            "updated_at": "2024-04-03T04:32:38.718Z",
            "deleted_at": null
          }
        },
        {
          "id": 7,
          "name": "fenil_project_3",
          "description": "projc desc",
          "startDate": "2024-12-11T18:30:00.000Z",
          "expectedEndDate": "2024-12-14T18:30:00.000Z",
          "actualEndDate": null,
          "status": "created",
          "clientEmail": "client@gmail.com",
          "created_at": "2024-04-04T04:43:37.095Z",
          "updated_at": "2024-04-04T04:43:37.095Z",
          "deleted_at": null,
          "pm_id": {
            "id": 1,
            "name": "Fenil",
            "email": "fenil@gmail.com",
            "role": "pm",
            "created_at": "2024-04-03T04:32:38.718Z",
            "updated_at": "2024-04-03T04:32:38.718Z",
            "deleted_at": null
          }
        },
        {
          "id": 8,
          "name": "fenil_project_3",
          "description": "projc desc",
          "startDate": "2024-12-11T18:30:00.000Z",
          "expectedEndDate": "2024-12-14T18:30:00.000Z",
          "actualEndDate": null,
          "status": "created",
          "clientEmail": "client@gmail.com",
          "created_at": "2024-04-04T04:44:25.345Z",
          "updated_at": "2024-04-04T04:44:25.345Z",
          "deleted_at": null,
          "pm_id": {
            "id": 1,
            "name": "Fenil",
            "email": "fenil@gmail.com",
            "role": "pm",
            "created_at": "2024-04-03T04:32:38.718Z",
            "updated_at": "2024-04-03T04:32:38.718Z",
            "deleted_at": null
          }
        },
        {
          "id": 3,
          "name": "fenil_project_3",
          "description": "projc desc",
          "startDate": "2024-12-11T18:30:00.000Z",
          "expectedEndDate": "2024-12-14T18:30:00.000Z",
          "actualEndDate": null,
          "status": "in_progress",
          "clientEmail": "client@gmail.com",
          "created_at": "2024-04-03T04:36:40.995Z",
          "updated_at": "2024-04-04T11:50:40.641Z",
          "deleted_at": null,
          "pm_id": {
            "id": 1,
            "name": "Fenil",
            "email": "fenil@gmail.com",
            "role": "pm",
            "created_at": "2024-04-03T04:32:38.718Z",
            "updated_at": "2024-04-03T04:32:38.718Z",
            "deleted_at": null
          }
        }
      ]

      jest.spyOn(service, 'findAll').mockImplementation(() => result)
      

      expect(await service.findAll()).toStrictEqual(result);

    })
  })
});
