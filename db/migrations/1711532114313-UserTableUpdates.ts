import { MigrationInterface, QueryRunner } from "typeorm";

export class UserTableUpdates1711532114313 implements MigrationInterface {
    name = 'UserTableUpdates1711532114313'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "createdDate" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" ADD "updatedDate" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" ADD "deletedDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deletedDate"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updatedDate"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "createdDate"`);
    }

}
