# RoboJourney XP System Documentation

## Overview
The RoboJourney XP System is a comprehensive gamification platform that tracks user progress through experience points (XP), levels, and badges. It's fully integrated into the application and automatically rewards users for various learning activities.

## Features

### 1. XP System
- **Automatic XP Awards**: Users earn XP for completing various activities
- **Activity Tracking**: All XP-earning activities are logged in the database
- **Real-time Updates**: XP updates immediately upon completing actions

### 2. Level System
- **10 Levels**: From "Novice Robot Builder" (Level 1) to "Grand Robotics Master" (Level 10)
- **Progressive Thresholds**: Each level requires exponentially more XP
- **Level-up Notifications**: Users receive celebratory toasts when leveling up

### 3. Badge System (Future Enhancement)
- **Predefined Badges**: 8 unique badges for different achievements
- **Tier System**: Bronze, Silver, Gold, and Platinum tiers
- **Auto-unlock**: Badges unlock automatically when criteria are met

## XP Rewards

| Activity | XP Earned |
|----------|-----------|
| Watch Video | 100 XP |
| Complete Activity | 200 XP |
| Finish Project | 1000 XP |
| Pass Quiz | 500 XP |
| Upload Document | 300 XP |
| Help Others | 150 XP |
| Create Resource | 250 XP |
| Rate Resource | 50 XP |
| Update Confidence | 75 XP |
| Daily Login | 100 XP |

## Level Progression

| Level | XP Required | Title |
|-------|-------------|-------|
| 1 | 0 | Novice Robot Builder |
| 2 | 500 | Mechanic Apprentice |
| 3 | 1,500 | Sensor Specialist |
| 4 | 3,000 | Circuit Master |
| 5 | 6,000 | Robotics Engineer |
| 6 | 12,000 | AI Programmer |
| 7 | 25,000 | Automation Architect |
| 8 | 50,000 | Robotics Innovator |
| 9 | 100,000 | Cybernetic Creator |
| 10 | 250,000 | Grand Robotics Master |

## Implementation

### Database Tables

#### `user_xp`
Stores user's total XP and current level:
- `id`: UUID primary key
- `user_id`: References auth.users
- `total_xp`: Total accumulated XP
- `current_level`: Current level (1-10)
- `created_at`, `updated_at`: Timestamps

#### `xp_activities`
Logs all XP-earning activities:
- `id`: UUID primary key
- `user_id`: References auth.users
- `activity_type`: Type of activity
- `xp_earned`: Amount of XP earned
- `description`: Activity description
- `created_at`: Timestamp

### React Components

#### `XPWidget`
- Displays current level, XP, and progress
- Shows progress bar to next level
- Provides access to activity history
- Located in dashboard sidebar

#### `XPLevelDisplay`
- Shows all 10 levels with progress
- Highlights current level
- Indicates unlocked vs locked levels
- Visual progress tracking

#### `ConfidenceManager`
- Allows users to update skill confidence
- Awards XP for confidence updates
- Interactive sliders for each skill

### React Hooks

#### `useXP`
Main hook for XP system:
```typescript
const { 
  userXP,           // Current user XP data
  activities,       // Recent activities
  addXP,           // Function to award XP
  currentLevelTitle, // Current level name
  progressToNextLevel, // Progress percentage
} = useXP();
```

#### `useConfidenceInit`
Automatically initializes confidence levels for new users with default categories:
- Programming
- Electronics
- Mechanical
- Design

## Configuration

The XP system can be configured via `public/xp-config.json`:
- Modify XP reward amounts
- Add/remove activity types
- Adjust level thresholds
- Customize level titles
- Define badge criteria

## Integration Points

The XP system is integrated at these key points:
1. **Project Completion**: Awards 1000 XP when progress reaches 100%
2. **Resource Creation**: Awards 250 XP for creating a resource (moderators)
3. **Confidence Updates**: Awards 75 XP for updating confidence levels
4. **Dashboard**: Displays XP widget and level progression

## Security

- **Row Level Security**: All XP tables use RLS
- **Server-side Validation**: XP calculations happen in the database
- **User Isolation**: Users can only view/modify their own XP

## Future Enhancements

1. **Badge Auto-unlock**: Implement automatic badge unlocking
2. **Daily Streaks**: Track login streaks with bonus XP
3. **Leaderboards**: Global and friend leaderboards
4. **XP Multipliers**: Temporary XP boosts for events
5. **Achievement Notifications**: Enhanced animations for milestones
6. **Social Features**: Share achievements on social media

## Usage Examples

### Award XP for custom activity:
```typescript
const { addXP } = useXP();

addXP({
  activityType: 'custom_activity',
  xpAmount: 200,
  description: 'Completed special challenge',
});
```

### Display compact XP info:
```typescript
import { XPLevelDisplay } from '@/components/XPLevelDisplay';

<XPLevelDisplay 
  totalXP={userXP.total_xp}
  currentLevel={userXP.current_level}
  compact={true}
/>
```

## Embedding the System

The XP system is fully embedded in the application. To add it to a new page:

1. Import the hook: `import { useXP } from '@/hooks/useXP';`
2. Use in component: `const { userXP, addXP } = useXP();`
3. Display widgets: `<XPWidget />` or `<XPLevelDisplay />`
4. Award XP: Call `addXP()` with activity details

## Support

For issues or questions about the XP system, check the codebase documentation or contact the development team.
