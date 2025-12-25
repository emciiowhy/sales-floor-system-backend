-- Alternative: Change constraint to CASCADE (auto-deletes related records)
-- WARNING: This will automatically delete PassUps and Breaks when an Agent is deleted
-- Run this in Neon.com SQL Editor

-- Step 1: Drop the existing foreign key constraints
ALTER TABLE "PassUp" 
DROP CONSTRAINT IF EXISTS "PassUp_agentId_fkey";

ALTER TABLE "Break" 
DROP CONSTRAINT IF EXISTS "Break_agentId_fkey";

-- Step 2: Recreate with CASCADE delete
ALTER TABLE "PassUp" 
ADD CONSTRAINT "PassUp_agentId_fkey" 
FOREIGN KEY ("agentId") 
REFERENCES "Agent"("id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;

ALTER TABLE "Break" 
ADD CONSTRAINT "Break_agentId_fkey" 
FOREIGN KEY ("agentId") 
REFERENCES "Agent"("id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Now you can delete agents and related records will be automatically deleted
DELETE FROM "Agent"
WHERE "id" IN (
  'cmjkp96610000auum9ix55ek6',
  'cmjkp96b00001auumn0bbflba',
  'cmjkp96cm0002auumifqhpjqs'
);

