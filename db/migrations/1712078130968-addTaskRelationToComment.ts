import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTaskRelationToComment1712078130968 implements MigrationInterface {
    name = 'AddTaskRelationToComment1712078130968'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" RENAME COLUMN "task_id" TO "taskIdId"`);
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "taskIdId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_1008c3feed1ad4866774103bede" FOREIGN KEY ("taskIdId") REFERENCES "task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_1008c3feed1ad4866774103bede"`);
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "taskIdId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "comment" RENAME COLUMN "taskIdId" TO "task_id"`);
    }

}
