import { MigrationInterface, QueryRunner } from "typeorm";

export class UserProjectSchema1712131848888 implements MigrationInterface {
    name = 'UserProjectSchema1712131848888'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_project" ("id" SERIAL NOT NULL, "userIdId" integer NOT NULL, "projectIdId" integer NOT NULL, CONSTRAINT "PK_72a40468c3924e43b934542e8e4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_project" ADD CONSTRAINT "FK_4b7ef7c13a3d0d2bbe0ae3a8097" FOREIGN KEY ("userIdId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_project" ADD CONSTRAINT "FK_3ae8b3e1c35bec7b0b5ce95654a" FOREIGN KEY ("projectIdId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_project" DROP CONSTRAINT "FK_3ae8b3e1c35bec7b0b5ce95654a"`);
        await queryRunner.query(`ALTER TABLE "user_project" DROP CONSTRAINT "FK_4b7ef7c13a3d0d2bbe0ae3a8097"`);
        await queryRunner.query(`DROP TABLE "user_project"`);
    }

}
