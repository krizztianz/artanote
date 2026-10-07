-- Re-generate all primary key IDs as standard UUIDs (replacing the old cuid
-- format, e.g. "cmuxu5cs00000ro2yonhts6f3"). The id columns stay TEXT (Prisma
-- still generates @default(uuid()) client-side), only the *values* change.
--
-- All foreign keys (Category.userId, Transaction.userId, Transaction.categoryId)
-- were created with ON UPDATE CASCADE, so updating the parent "id" columns
-- automatically propagates the new values to every referencing row — no
-- manual FK remapping needed. Order matters: update parents before their
-- own id is no longer needed to look up children.

-- User.id change cascades into Category.userId and Transaction.userId
UPDATE "User" SET "id" = gen_random_uuid()::text;

-- Category.id change cascades into Transaction.categoryId
UPDATE "Category" SET "id" = gen_random_uuid()::text;

-- Transaction.id has no dependents, safe to regenerate directly
UPDATE "Transaction" SET "id" = gen_random_uuid()::text;
