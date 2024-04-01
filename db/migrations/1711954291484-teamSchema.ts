import { MigrationInterface, QueryRunner } from "typeorm";

export class TeamSchema1711954291484 implements MigrationInterface {
    name = 'TeamSchema1711954291484'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "department" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "deleted_at" TIMESTAMP, CONSTRAINT "PK_9a2213262c1593bffb581e382f5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "department_user" ("id" SERIAL NOT NULL, "departmentIdId" integer NOT NULL, "userIdId" integer NOT NULL, CONSTRAINT "PK_9104d98173511557613e7ef99be" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "team" ("id" SERIAL NOT NULL, "deleted_at" TIMESTAMP, "projectIdId" integer NOT NULL, CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "team_user" ("id" SERIAL NOT NULL, "teamIdId" integer NOT NULL, "userIdId" integer NOT NULL, CONSTRAINT "PK_add64c4bdc53d926d9c0992bccc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `);
        await queryRunner.query(`CREATE TABLE "project" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "startDate" TIMESTAMP NOT NULL, "expectedEndDate" TIMESTAMP NOT NULL, "actualEndDate" TIMESTAMP, "status" "public"."project_status_enum" NOT NULL DEFAULT 'created', "clientEmail" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "pmIdId" integer NOT NULL, CONSTRAINT "PK_4d68b1358bb5b766d3e78f32f57" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "department_user" ADD CONSTRAINT "FK_70d52909e71131f241a436a49a9" FOREIGN KEY ("departmentIdId") REFERENCES "department"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "department_user" ADD CONSTRAINT "FK_dd545b10ca5f86ddbbf577b0bd9" FOREIGN KEY ("userIdId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team" ADD CONSTRAINT "FK_2f9d038292c1912e6168ea606ea" FOREIGN KEY ("projectIdId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_user" ADD CONSTRAINT "FK_6d040583ffe0c2c3dfd61918f10" FOREIGN KEY ("teamIdId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_user" ADD CONSTRAINT "FK_719b3e3f2eefd2ffa0a03f9eb35" FOREIGN KEY ("userIdId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "project" ADD CONSTRAINT "FK_943b7f47ea04e8c9cb7cddf7b9d" FOREIGN KEY ("pmIdId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT "FK_943b7f47ea04e8c9cb7cddf7b9d"`);
        await queryRunner.query(`ALTER TABLE "team_user" DROP CONSTRAINT "FK_719b3e3f2eefd2ffa0a03f9eb35"`);
        await queryRunner.query(`ALTER TABLE "team_user" DROP CONSTRAINT "FK_6d040583ffe0c2c3dfd61918f10"`);
        await queryRunner.query(`ALTER TABLE "team" DROP CONSTRAINT "FK_2f9d038292c1912e6168ea606ea"`);
        await queryRunner.query(`ALTER TABLE "department_user" DROP CONSTRAINT "FK_dd545b10ca5f86ddbbf577b0bd9"`);
        await queryRunner.query(`ALTER TABLE "department_user" DROP CONSTRAINT "FK_70d52909e71131f241a436a49a9"`);
        await queryRunner.query(`DROP TABLE "project"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "team_user"`);
        await queryRunner.query(`DROP TABLE "team"`);
        await queryRunner.query(`DROP TABLE "department_user"`);
        await queryRunner.query(`DROP TABLE "department"`);
    }

}
