import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1712118639729 implements MigrationInterface {
    name = 'InitialMigration1712118639729'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "task_user" ("id" SERIAL NOT NULL, "taskIdId" integer NOT NULL, "userIdId" integer NOT NULL, CONSTRAINT "PK_6ea2c1c13f01b7a383ebbeaebb0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."task_status_enum" AS ENUM('created', 'in_progress', 'completed')`);
        await queryRunner.query(`CREATE TYPE "public"."task_priority_enum" AS ENUM('high', 'low', 'medium', 'none')`);
        await queryRunner.query(`CREATE TABLE "task" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "status" "public"."task_status_enum" NOT NULL DEFAULT 'created', "priority" "public"."task_priority_enum" NOT NULL DEFAULT 'none', "startDate" TIMESTAMP NOT NULL, "expectedEndDate" TIMESTAMP NOT NULL, "actualEndDate" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "projectIdId" integer, CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."project_status_enum" AS ENUM('created', 'in_progress', 'completed')`);
        await queryRunner.query(`CREATE TABLE "project" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "startDate" TIMESTAMP NOT NULL, "expectedEndDate" TIMESTAMP NOT NULL, "actualEndDate" TIMESTAMP, "status" "public"."project_status_enum" NOT NULL DEFAULT 'created', "clientEmail" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "pmIdId" integer NOT NULL, CONSTRAINT "PK_4d68b1358bb5b766d3e78f32f57" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "department" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "deleted_at" TIMESTAMP, CONSTRAINT "PK_9a2213262c1593bffb581e382f5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "department_user" ("id" SERIAL NOT NULL, "departmentIdId" integer NOT NULL, "userIdId" integer NOT NULL, CONSTRAINT "PK_9104d98173511557613e7ef99be" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'employee', 'pm')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `);
        await queryRunner.query(`CREATE TABLE "team_user" ("id" SERIAL NOT NULL, "teamIdId" integer NOT NULL, "userIdId" integer NOT NULL, CONSTRAINT "PK_add64c4bdc53d926d9c0992bccc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "team" ("id" SERIAL NOT NULL, "deleted_at" TIMESTAMP, "projectIdId" integer NOT NULL, CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "task_user" ADD CONSTRAINT "FK_2b7adf4d2b547890c0c588f62f5" FOREIGN KEY ("taskIdId") REFERENCES "task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_user" ADD CONSTRAINT "FK_0792c1f9d8df0bc4fda256b15d3" FOREIGN KEY ("userIdId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_e8f638249f4b478ecd9b2a66127" FOREIGN KEY ("projectIdId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "project" ADD CONSTRAINT "FK_943b7f47ea04e8c9cb7cddf7b9d" FOREIGN KEY ("pmIdId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "department_user" ADD CONSTRAINT "FK_70d52909e71131f241a436a49a9" FOREIGN KEY ("departmentIdId") REFERENCES "department"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "department_user" ADD CONSTRAINT "FK_dd545b10ca5f86ddbbf577b0bd9" FOREIGN KEY ("userIdId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_user" ADD CONSTRAINT "FK_6d040583ffe0c2c3dfd61918f10" FOREIGN KEY ("teamIdId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_user" ADD CONSTRAINT "FK_719b3e3f2eefd2ffa0a03f9eb35" FOREIGN KEY ("userIdId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team" ADD CONSTRAINT "FK_2f9d038292c1912e6168ea606ea" FOREIGN KEY ("projectIdId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "team" DROP CONSTRAINT "FK_2f9d038292c1912e6168ea606ea"`);
        await queryRunner.query(`ALTER TABLE "team_user" DROP CONSTRAINT "FK_719b3e3f2eefd2ffa0a03f9eb35"`);
        await queryRunner.query(`ALTER TABLE "team_user" DROP CONSTRAINT "FK_6d040583ffe0c2c3dfd61918f10"`);
        await queryRunner.query(`ALTER TABLE "department_user" DROP CONSTRAINT "FK_dd545b10ca5f86ddbbf577b0bd9"`);
        await queryRunner.query(`ALTER TABLE "department_user" DROP CONSTRAINT "FK_70d52909e71131f241a436a49a9"`);
        await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT "FK_943b7f47ea04e8c9cb7cddf7b9d"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_e8f638249f4b478ecd9b2a66127"`);
        await queryRunner.query(`ALTER TABLE "task_user" DROP CONSTRAINT "FK_0792c1f9d8df0bc4fda256b15d3"`);
        await queryRunner.query(`ALTER TABLE "task_user" DROP CONSTRAINT "FK_2b7adf4d2b547890c0c588f62f5"`);
        await queryRunner.query(`DROP TABLE "team"`);
        await queryRunner.query(`DROP TABLE "team_user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "department_user"`);
        await queryRunner.query(`DROP TABLE "department"`);
        await queryRunner.query(`DROP TABLE "project"`);
        await queryRunner.query(`DROP TYPE "public"."project_status_enum"`);
        await queryRunner.query(`DROP TABLE "task"`);
        await queryRunner.query(`DROP TYPE "public"."task_priority_enum"`);
        await queryRunner.query(`DROP TYPE "public"."task_status_enum"`);
        await queryRunner.query(`DROP TABLE "task_user"`);
    }

}
