import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaskStatus1793303819480 implements MigrationInterface {
  name = 'AddTaskStatus1793303819480';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tasks"
      ADD COLUMN IF NOT EXISTS "status" varchar(20) DEFAULT 'todo' NOT NULL
    `);
    await queryRunner.query(`
      UPDATE "tasks"
      SET "status" = CASE WHEN "completed" THEN 'done' ELSE 'todo' END
      WHERE "status" = 'todo'
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "tasks" DROP COLUMN IF EXISTS "status"');
  }
}
