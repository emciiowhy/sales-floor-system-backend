# Break Schedule System Setup

## What's Been Added

### 1. Database Schema
- Added `BreakSchedule` model to Prisma schema
- Stores break times, lunch time, end of shift, and alarm settings

### 2. Backend API
- `/api/break-schedules/agent/:agentId` - GET (get or create schedule)
- `/api/break-schedules/agent/:agentId` - PUT (update schedule)

### 3. Frontend Components
- `BreakSchedule` component - displays and manages break schedule
- `useBreakAlarm` hook - handles alarm logic and buzzer tones

### 4. Features
- ✅ Break schedule management (First Break, Second Break, Lunch, End of Shift)
- ✅ Audio buzzer alarm using Web Audio API
- ✅ Browser notifications
- ✅ Toast notifications
- ✅ Alarm volume control
- ✅ Enable/disable alarms
- ✅ Real-time countdown to next alarm

## Setup Instructions

### 1. Run Database Migration

```bash
cd backend
npx prisma migrate dev --name add_break_schedule
```

This will create the `BreakSchedule` table in your database.

### 2. Generate Prisma Client

```bash
npm run prisma:generate
```

### 3. Start Backend Server

```bash
npm run dev
```

### 4. Start Frontend

```bash
cd ../frontend
npm run dev
```

## How It Works

1. **Break Schedule**: Each agent can set their break times, lunch time, and end of shift
2. **Alarm System**: 
   - Checks every 10 seconds for upcoming alarms
   - Triggers 1 minute before and at the exact time
   - Plays buzzer tone using Web Audio API
   - Shows toast notification
   - Sends browser notification (if permitted)
3. **Alarm Types**:
   - First Break
   - Second Break (optional)
   - Lunch Time
   - End of Shift

## Customization

- Default times can be changed in the `BreakSchedule` component
- Alarm volume can be adjusted (0-100%)
- Alarms can be enabled/disabled per agent
- Buzzer tone can be customized in `useBreakAlarm.jsx`

## Browser Permissions

The system will request notification permission on first use. Users should allow notifications for the best experience.

