import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ProjectController (e2e)', () => {
  let app: INestApplication;
  const adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpZCI6MywiaWF0IjoxNzE1MDgxOTIxLCJleHAiOjE3MTUyNTQ3MjF9.oFAJFhO2XW2lkQbUy4qG1029Ywm1RnLDdpebwMtc9UM"

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // it('/projects (POST) - Create project', () => {
  //   return request(app.getHttpServer())
  //     .post('/api/v1/projects')
  //     .set('Authorization', `Bearer ${adminToken}`)
  //     .send({
  //       name: 'Test Project',
  //       description: 'Test Project Description',
  //       startDate: new Date(),
  //       expectedEndDate: new Date(),
  //       clientEmail: 'test@example.com',
  //       pm_id: 1,
  //     })
  //     .expect(HttpStatus.CREATED);
  // });

  it('/projects (GET) - Get all projects', () => {
    return request(app.getHttpServer())
      .get('/api/v1/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(HttpStatus.OK);
  });

  // it('/projects/:id (GET) - Get project by id', async () => {
  //   const createResponse = await request(app.getHttpServer())
  //     .post('/projects')
  //     .send({
  //       name: 'Test Project',
  //       description: 'Test Project Description',
  //       startDate: new Date(),
  //       expectedEndDate: new Date(),
  //       clientEmail: 'test@example.com',
  //       pm_id: 1,
  //     });

  //   const projectId = createResponse.body.id;

  //   return request(app.getHttpServer())
  //     .get(`/projects/${projectId}`)
  //     .expect(HttpStatus.OK);
  // });

  // Add more tests for other endpoints as needed
});
