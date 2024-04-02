import { MigrationInterface, QueryRunner } from "typeorm";

export class TaskSchema1712033686467 implements MigrationInterface {
    name = 'TaskSchema1712033686467'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "task_user" ("id" SERIAL NOT NULL, "taskIdId" integer NOT NULL, "userIdId" integer NOT NULL, CONSTRAINT "PK_6ea2c1c13f01b7a383ebbeaebb0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."task_status_enum" AS ENUM('created', 'in_progress', 'completed')`);
        await queryRunner.query(`CREATE TYPE "public"."task_priority_enum" AS ENUM('high', 'low', 'medium', 'none')`);
        await queryRunner.query(`CREATE TABLE "task" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "status" "public"."task_status_enum" NOT NULL, "priority" "public"."task_priority_enum" NOT NULL DEFAULT 'none', "startDate" TIMESTAMP NOT NULL, "expectedEndDate" TIMESTAMP NOT NULL, "actualEndDate" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "projectIdId" integer, CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "task_user" ADD CONSTRAINT "FK_2b7adf4d2b547890c0c588f62f5" FOREIGN KEY ("taskIdId") REFERENCES "task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_user" ADD CONSTRAINT "FK_0792c1f9d8df0bc4fda256b15d3" FOREIGN KEY ("userIdId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_e8f638249f4b478ecd9b2a66127" FOREIGN KEY ("projectIdId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_e8f638249f4b478ecd9b2a66127"`);
        await queryRunner.query(`ALTER TABLE "task_user" DROP CONSTRAINT "FK_0792c1f9d8df0bc4fda256b15d3"`);
        await queryRunner.query(`ALTER TABLE "task_user" DROP CONSTRAINT "FK_2b7adf4d2b547890c0c588f62f5"`);
        await queryRunner.query(`DROP TABLE "task"`);
        await queryRunner.query(`DROP TYPE "public"."task_priority_enum"`);
        await queryRunner.query(`DROP TYPE "public"."task_status_enum"`);
        await queryRunner.query(`DROP TABLE "task_user"`);
    }

}
