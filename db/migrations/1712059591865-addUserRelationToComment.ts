import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserRelationToComment1712059591865 implements MigrationInterface {
    name = 'AddUserRelationToComment1712059591865'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" RENAME COLUMN "emp_id" TO "empIdId"`);
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "empIdId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_6fbcadaf963376a951761036df3" FOREIGN KEY ("empIdId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_6fbcadaf963376a951761036df3"`);
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "empIdId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "comment" RENAME COLUMN "empIdId" TO "emp_id"`);
    }

}
