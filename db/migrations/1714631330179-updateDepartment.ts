import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDepartment1714631330179 implements MigrationInterface {
    name = 'UpdateDepartment1714631330179'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "department" ADD CONSTRAINT "UQ_471da4b90e96c1ebe0af221e07b" UNIQUE ("name")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "department" DROP CONSTRAINT "UQ_471da4b90e96c1ebe0af221e07b"`);
    }

}
