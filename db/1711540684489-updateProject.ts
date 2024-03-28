import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateProject1711540684489 implements MigrationInterface {
    name = 'UpdateProject1711540684489'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT "FK_943b7f47ea04e8c9cb7cddf7b9d"`);
        await queryRunner.query(`ALTER TABLE "project" ALTER COLUMN "pmIdId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "project" ADD CONSTRAINT "FK_943b7f47ea04e8c9cb7cddf7b9d" FOREIGN KEY ("pmIdId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT "FK_943b7f47ea04e8c9cb7cddf7b9d"`);
        await queryRunner.query(`ALTER TABLE "project" ALTER COLUMN "pmIdId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "project" ADD CONSTRAINT "FK_943b7f47ea04e8c9cb7cddf7b9d" FOREIGN KEY ("pmIdId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
