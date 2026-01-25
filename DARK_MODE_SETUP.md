# Dark Mode Implementation Guide

Your app now supports both light and dark modes! Here's what was set up:

## ✅ Completed Setup

1. **Theme Provider** - Already configured in `layout.tsx`
   - Uses `next-themes` for theme persistence
   - Supports system preference detection
   - Mode toggle button in bottom-right corner

2. **Main Page Colors Updated** (`page.tsx`)
   - Light: White background with black text
   - Dark: Dark background (#0a0a0a) with white text
   - Proper contrast for readability in both modes

## 📋 Remaining Component Updates Needed

All components need the following pattern applied to their classes:

### Before (Dark-only):
```tsx
className="border-zinc-800 text-zinc-100 bg-zinc-900"
```

### After (Light + Dark):
```tsx
className="border-zinc-200 dark:border-zinc-800 text-black dark:text-zinc-100 bg-white dark:bg-zinc-900"
```

## Components to Update

- [ ] **LootTab.tsx** - Card, Input, Select, Button styles
- [ ] **ParticipantsTab.tsx** - Card, Input, Badge, ScrollArea styles  
- [ ] **RaffleTab.tsx** - Wheel, Badge, Button, ScrollArea styles
- [ ] **HistoryTab.tsx** - Card, Badge, ScrollArea styles

## Color Mapping

| Element | Light | Dark |
|---------|-------|------|
| Background | `bg-white` | `dark:bg-zinc-900` |
| Text | `text-black` | `dark:text-white` |
| Border | `border-zinc-200` | `dark:border-zinc-800` |
| Cards | `bg-zinc-50` | `dark:bg-zinc-900/50` |
| Secondary | `bg-zinc-100` | `dark:bg-zinc-800` |

## Quick Find & Replace Patterns

For each component, replace:
- `border-zinc-800` → `border-zinc-200 dark:border-zinc-800`
- `text-zinc-100` → `text-black dark:text-zinc-100`
- `bg-zinc-900` → `bg-white dark:bg-zinc-900`
- `bg-zinc-950` → `bg-zinc-50 dark:bg-zinc-950`
- `hover:bg-zinc-800` → `hover:bg-zinc-100 dark:hover:bg-zinc-800`
