import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTaskHoursTable1712221557800 implements MigrationInterface {
    name = 'CreateTaskHoursTable1712221557800'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "task_hour" ("id" SERIAL NOT NULL, "hours" integer NOT NULL, "description" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "taskUserIdId" integer, CONSTRAINT "PK_d034ea7aa01a4e05a15a8deaba9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "task_hour" ADD CONSTRAINT "FK_7870d2149b5633003c0d8ab73eb" FOREIGN KEY ("taskUserIdId") REFERENCES "task_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_hour" DROP CONSTRAINT "FK_7870d2149b5633003c0d8ab73eb"`);
        await queryRunner.query(`DROP TABLE "task_hour"`);
    }

}
