import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateComment1712036924730 implements MigrationInterface {
    name = 'CreateComment1712036924730'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "comment" ("id" SERIAL NOT NULL, "emp_id" integer NOT NULL, "task_id" integer NOT NULL, "content" character varying NOT NULL, "edited" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "comment"`);
    }

}
