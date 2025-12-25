-- Fix: Delete Agents with Foreign Key Constraint Error
-- Run this in Neon.com SQL Editor

-- Step 1: Delete all PassUp records for these agents
DELETE FROM "PassUp"
WHERE "agentId" IN (
  'cmjkp96610000auum9ix55ek6',
  'cmjkp96b00001auumn0bbflba',
  'cmjkp96cm0002auumifqhpjqs'
);

-- Step 2: Delete all Break records for these agents
DELETE FROM "Break"
WHERE "agentId" IN (
  'cmjkp96610000auum9ix55ek6',
  'cmjkp96b00001auumn0bbflba',
  'cmjkp96cm0002auumifqhpjqs'
);

-- Step 3: Now you can delete the agents
DELETE FROM "Agent"
WHERE "id" IN (
  'cmjkp96610000auum9ix55ek6',
  'cmjkp96b00001auumn0bbflba',
  'cmjkp96cm0002auumifqhpjqs'
);

