import { MigrationInterface, QueryRunner } from "typeorm";

export class DepartmentSchemaGeneration1711900651595 implements MigrationInterface {
    name = 'DepartmentSchemaGeneration1711900651595'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "department" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "deleted_at" TIMESTAMP, CONSTRAINT "PK_9a2213262c1593bffb581e382f5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "department_user" ("id" SERIAL NOT NULL, "departmentIdId" integer NOT NULL, "userIdId" integer NOT NULL, CONSTRAINT "PK_9104d98173511557613e7ef99be" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "department_user" ADD CONSTRAINT "FK_70d52909e71131f241a436a49a9" FOREIGN KEY ("departmentIdId") REFERENCES "department"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "department_user" ADD CONSTRAINT "FK_dd545b10ca5f86ddbbf577b0bd9" FOREIGN KEY ("userIdId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "department_user" DROP CONSTRAINT "FK_dd545b10ca5f86ddbbf577b0bd9"`);
        await queryRunner.query(`ALTER TABLE "department_user" DROP CONSTRAINT "FK_70d52909e71131f241a436a49a9"`);
        await queryRunner.query(`DROP TABLE "department_user"`);
        await queryRunner.query(`DROP TABLE "department"`);
    }

}
