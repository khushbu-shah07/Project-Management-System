import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from 'bcrypt';

 async function hashPassword(password: string): Promise<string> {
    const Rounds = 10;
    const hash = await bcrypt.hash(password, Rounds);
    return hash;
  }

export class CreateAdminUser1713168482619 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO "user"("email","role","name","password") VALUES('admin@gmail.com','admin','admin','${await hashPassword("admin")}')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "user" where email = "admin@gmail.com"`)
    }

}
