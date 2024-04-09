import { Test, TestingModule } from '@nestjs/testing';
import { UserprojectController } from './userproject.controller';
import { UserprojectService } from './userproject.service';

describe('UserprojectController', () => {
  let controller: UserprojectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserprojectController],
      providers: [UserprojectService],
    }).compile();

    controller = module.get<UserprojectController>(UserprojectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
