-- Add Role enum + role/mustChangePassword columns to User, and seed a
-- default Admin account.
--
-- IMPORTANT: the seeded Admin account below uses a well-known default
-- password ("ChangeMe123!"). This is intentional and safe only because
-- `mustChangePassword` is seeded as `true`, so the app forces a password
-- change on first login before the account can be used for anything else.
-- Do not reuse this password/hash pattern for accounts that skip the
-- forced-change flow.

CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

ALTER TABLE "User" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'USER';
ALTER TABLE "User" ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;

-- Idempotent seed: skip if an admin@artanote.app row already exists (e.g.
-- this migration re-running against a DB where it already applied before
-- a shadow-db diff, or a manual re-seed).
INSERT INTO "User" (id, name, email, "passwordHash", role, "mustChangePassword", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'Administrator',
  'admin@artanote.app',
  '$2b$10$SptWeETmsXw5LQu/ZqR9pONEAz7aQAUE1V4ZP3G9EitTI2x1ObIay',
  'ADMIN',
  true,
  now(),
  now()
)
ON CONFLICT (email) DO NOTHING;
