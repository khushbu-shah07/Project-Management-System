import { Test, TestingModule } from '@nestjs/testing';
import { UserprojectService } from './userproject.service';

describe('UserprojectService', () => {
  let service: UserprojectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserprojectService],
    }).compile();

    service = module.get<UserprojectService>(UserprojectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
