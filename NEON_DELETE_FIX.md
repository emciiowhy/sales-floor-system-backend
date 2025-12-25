# How to Fix Foreign Key Constraint Error in Neon.com

## Problem
You're trying to delete Agents but getting this error:
```
Error: update or delete on table "Agent" violates foreign key constraint "PassUp_agentId_fkey" on table "PassUp"
```

## Why This Happens
The foreign key constraint is set to `ON DELETE RESTRICT`, which prevents deleting an Agent if there are PassUp or Break records that reference it.

## Solutions

### Option 1: Delete Related Records First (Recommended)

**Steps:**
1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Go to **SQL Editor**
4. Run these queries **in order**:

```sql
-- Step 1: Delete PassUp records for these agents
DELETE FROM "PassUp"
WHERE "agentId" IN (
  'cmjkp96610000auum9ix55ek6',
  'cmjkp96b00001auumn0bbflba',
  'cmjkp96cm0002auumifqhpjqs'
);

-- Step 2: Delete Break records for these agents
DELETE FROM "Break"
WHERE "agentId" IN (
  'cmjkp96610000auum9ix55ek6',
  'cmjkp96b00001auumn0bbflba',
  'cmjkp96cm0002auumifqhpjqs'
);

-- Step 3: Now delete the agents
DELETE FROM "Agent"
WHERE "id" IN (
  'cmjkp96610000auum9ix55ek6',
  'cmjkp96b00001auumn0bbflba',
  'cmjkp96cm0002auumifqhpjqs'
);
```

### Option 2: Change Constraint to CASCADE (Auto-delete related records)

**⚠️ WARNING:** This will automatically delete all PassUps and Breaks when you delete an Agent.

1. Go to Neon SQL Editor
2. Run this to change the constraint:

```sql
-- Drop existing constraints
ALTER TABLE "PassUp" DROP CONSTRAINT IF EXISTS "PassUp_agentId_fkey";
ALTER TABLE "Break" DROP CONSTRAINT IF EXISTS "Break_agentId_fkey";

-- Recreate with CASCADE
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
```

3. After this, you can delete agents directly and related records will be auto-deleted.

**Note:** If you use this option, you'll also need to update your Prisma schema and create a migration:

```prisma
// In schema.prisma, change the relations to:
model PassUp {
  // ... other fields
  agent         Agent    @relation(fields: [agentId], references: [id], onDelete: Cascade)
}

model Break {
  // ... other fields
  agent     Agent    @relation(fields: [agentId], references: [id], onDelete: Cascade)
}
```

Then run: `npx prisma migrate dev --name cascade_delete`

### Option 3: Reassign Records to Another Agent

If you want to keep the PassUp and Break records but reassign them to a different agent:

```sql
-- First, find an agent ID to reassign to (replace with actual ID)
-- Then update PassUps
UPDATE "PassUp"
SET "agentId" = 'NEW_AGENT_ID_HERE'
WHERE "agentId" IN (
  'cmjkp96610000auum9ix55ek6',
  'cmjkp96b00001auumn0bbflba',
  'cmjkp96cm0002auumifqhpjqs'
);

-- Update Breaks
UPDATE "Break"
SET "agentId" = 'NEW_AGENT_ID_HERE'
WHERE "agentId" IN (
  'cmjkp96610000auum9ix55ek6',
  'cmjkp96b00001auumn0bbflba',
  'cmjkp96cm0002auumifqhpjqs'
);

-- Now delete the agents
DELETE FROM "Agent"
WHERE "id" IN (
  'cmjkp96610000auum9ix55ek6',
  'cmjkp96b00001auumn0bbflba',
  'cmjkp96cm0002auumifqhpjqs'
);
```

## Quick Access to Neon SQL Editor

1. Go to https://console.neon.tech
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Paste and run the SQL queries above

## Recommendation

**Use Option 1** if you want to explicitly control what gets deleted.
**Use Option 2** if you want agents and their data to be deleted together automatically (more convenient but less control).

