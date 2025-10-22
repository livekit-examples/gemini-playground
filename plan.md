# Gemini Playground - Design System Migration Cheatsheet

## Executive Summary

This document captures the complete migration from the original styling system to a modern design system, including Next.js 15, React 19, and Tailwind CSS v4 upgrades, along with comprehensive UI/UX improvements.

## Technology Stack Changes

### Framework Upgrades

- **Next.js**: Upgraded to `15.4.6`
- **React**: Upgraded to `19.1.0`
- **Tailwind CSS**: Migrated from v3 to `4.1.14`
- **PostCSS**: Updated to use `@tailwindcss/postcss` plugin

### Dependency Resolution

- **React 19 Compatibility Issue**: `@react-three/fiber`, `@react-three/drei`, and `@react-three/postprocessing` required version upgrades to support React 19
- **Next.js 15 Changes**: `searchParams` in `generateMetadata` now returns a Promise that must be awaited
- **Dynamic Imports**: Removed `ssr: false` from `next/dynamic` in Server Components (direct import client components instead)

## Design System - Semantic Color Tokens

### Color Token System (from `globals.css`)

**Background Layers**

- `bg0`: Base background (lightest in light mode, darkest in dark mode)
- `bg1`: Primary surface color
- `bg2`: Secondary surface color  
- `bg3`: Tertiary surface color

**Foreground Text**

- `fg0`: Primary text (highest contrast)
- `fg1`: Secondary text
- `fg2`: Tertiary text
- `fg3`: Muted text
- `fg4`: Disabled text
- `fg5`: Most subtle text

**Accent Colors**

- `fgAccent1`: Primary accent (blue)
- `fgAccent2`: Accent hover state

**Semantic Colors**

- `serious1`, `serious2`: Warning/destructive backgrounds
- `fgSerious1`: Warning/destructive foreground

**Separators**

- `separator1`: Primary borders
- `separator2`: Secondary borders

### Migration Pattern

**Old Pattern (Tailwind v3)**

```tsx
className="bg-neutral-900 text-neutral-500 border-neutral-800"
```

**New Pattern (Design System)**

```tsx
className="bg-bg1 text-fg2 border-separator1"
```

## Tailwind CSS v4 Migration

### Configuration Changes

**Old Setup** (`tailwind.config.ts`)

- Separate config file with theme customization
- Traditional plugin system

**New Setup** (`globals.css`)

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-bg0: /* light/dark values */;
  --color-bg1: /* light/dark values */;
  /* ... more tokens ... */
}
```

**PostCSS Config Update**

```js
export default {
  plugins: ["@tailwindcss/postcss"],
};
```

## Component Updates

### Button Component

**File**: `web/src/components/ui/button.tsx`

**Variants**

- `primary`: Blue accent background
- `secondary`: Subtle gray background  
- `outline`: Border with transparent background
- `ghost`: Transparent with hover
- `destructive`: Red warning style

**Sizes**

- `sm`: Height 7 (h-7)
- `lg`: Height 9 (h-9)
- `xl`: Height 11 (h-11)
- `icon`: 7x8 (h-7 w-8)

**Special Props**

- `leftIcon`: Icon before text
- `rightIcon`: Icon after text
- `asChild`: Use Slot for composition

**Usage Pattern**

```tsx
<Button 
  variant="primary" 
  size="lg"
  leftIcon={<ArrowUpRight />}
  onClick={handleClick}
>
  Get building!
</Button>
```

### Dialog Component

**File**: `web/src/components/ui/dialog.tsx`

**Key Updates**

- Background: `bg-bg1` (was `bg-neutral-800`)
- Text: `text-fg0` for proper contrast
- Border: `border-separator1`
- Description: `text-fg2`

**Modal Structure Pattern**

```tsx
<DialogContent className="gap-0 p-0">
  <div className="px-6 py-5 border-b border-separator1">
    <DialogHeader>
      <DialogTitle className="text-2xl font-semibold text-fg0">
        Title
      </DialogTitle>
      <DialogDescription className="text-base text-fg2">
        Description
      </DialogDescription>
    </DialogHeader>
  </div>
  
  <div className="px-6 py-4">
    {/* Content */}
  </div>
  
  <div className="px-6 py-4 bg-bg2 border-t border-separator1">
    {/* Footer */}
  </div>
</DialogContent>
```

### Popover Component

**File**: `web/src/components/ui/popover.tsx`

**Updates**

- `bg-bg1`: Main background
- `border-separator1`: Border color
- `text-fg0`: Text color
- `rounded-lg`: Rounded corners
- `shadow-lg`: Prominent shadow

### Sidebar Component

**File**: `web/src/components/ui/sidebar.tsx`

**Configuration**

- `SIDEBAR_WIDTH`: Changed to `340px` (from `258px`)
- Removed `collapsible` prop for always-open behavior
- Integration with `SidebarProvider`

**Key Components**

- `SidebarProvider`: Context wrapper
- `Sidebar`: Main container
- `SidebarHeader`: Top section
- `SidebarContent`: Scrollable middle
- `SidebarFooter`: Bottom section
- `SidebarInset`: Main content wrapper

### Select Component

**File**: `web/src/components/ui/select.tsx`

**Variants**

- `primary`: Blue accent style
- `ghost`: Transparent style

**Sizes**

- `sm`: Small
- `md`: Medium (default)

### Slider Component

**File**: `web/src/components/ui/slider.tsx`

**Critical Fix for Light Theme**

```tsx
// Track
className="bg-separator2"

// Range
className="bg-fg2"

// Thumb
className="border-separator1 bg-bg0"
```

## Layout Architecture

### Root Layout Structure

**File**: `web/src/app/layout.tsx`

```tsx
<ThemeProvider>
  <PHProvider>
    <PlaygroundStateProvider>
      <ConnectionProvider>
        <TooltipProvider>
          <RoomWrapper> {/* LiveKit context */}
            <SidebarProvider defaultOpen={true}>
              <Sidebar>
                <SidebarHeader>
                  <NavLogo />
                </SidebarHeader>
                <SidebarContent>
                  <ConfigurationForm />
                </SidebarContent>
                <SidebarFooter>
                  <ThemeToggle />
                </SidebarFooter>
              </Sidebar>
              <SidebarInset>
                {children}
              </SidebarInset>
            </SidebarProvider>
          </RoomWrapper>
        </TooltipProvider>
      </ConnectionProvider>
    </PlaygroundStateProvider>
  </PHProvider>
</ThemeProvider>
```

**Critical Pattern**: `RoomWrapper` must wrap entire app to provide LiveKit context to all components, including those in the sidebar.

### Page Structure

**File**: `web/src/app/page.tsx`

```tsx
<div className="flex flex-col h-full bg-bg0">
  <header className="px-8 py-4 border-b border-separator1">
    {/* Title and actions */}
  </header>
  <main className="flex flex-col flex-grow overflow-hidden p-4">
    <div className="rounded-2xl bg-bg1 border border-separator1">
      <Chat />
    </div>
  </main>
  <footer className="px-8 py-3 border-t border-separator1 text-fg3">
    {/* Footer content */}
  </footer>
</div>
```

## LiveKit Agents Integration

### Current Model Name

- **Gemini Model**: `gemini-2.0-flash-exp` (verified against official LiveKit docs)
- Used in both Python and TypeScript implementations

### Python Implementation (Current)

**File**: `web/src/components/code-viewer.tsx`

```python
from livekit import agents
from livekit.agents import Agent, AgentSession, JobContext, WorkerOptions, cli
from livekit.plugins import google

async def entrypoint(ctx: JobContext):
    await ctx.connect()

    session = AgentSession(
        llm=google.realtime.RealtimeModel(
            voice="Puck",
            temperature=0.8,
            max_output_tokens="inf",
            modalities=["audio"],
        )
    )

    await session.start(
        room=ctx.room,
        agent=Agent(
            instructions="""..."""
        )
    )

    await session.generate_reply(
        instructions="Greet the user and offer your assistance."
    )

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
```

### TypeScript Implementation (Current)

```typescript
import { defineAgent, type JobContext, WorkerOptions, cli, voice } from '@livekit/agents';
import * as google from '@livekit/agents-plugin-google';
import { fileURLToPath } from 'node:url';

export default defineAgent({
  entry: async (ctx: JobContext) => {
    await ctx.connect();

    const agent = new voice.Agent({
      instructions: `...`,
    });

    const session = new voice.AgentSession({
      llm: new google.beta.realtime.RealtimeModel({
        voice: 'Puck',
        temperature: 0.8,
        maxOutputTokens: Infinity,
        modalities: ["audio"],
      }),
    });

    await session.start({ agent, room: ctx.room });
    await session.generateReply({
      instructions: 'Greet the user and offer your assistance.',
    });
  },
});

cli.runApp(new WorkerOptions({ agent: fileURLToPath(import.meta.url) }));
```

## Common Issues and Fixes

### Issue 1: Next.js 15 - searchParams Error

**Error**: `searchParams should be awaited before using its properties`

**Fix**:

```tsx
// Before
export async function generateMetadata({ searchParams }) {
  const presetId = searchParams?.preset;
}

// After
export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const presetId = params?.preset;
}
```

### Issue 2: Dynamic Import with ssr:false

**Error**: `ssr: false is not allowed with next/dynamic in Server Components`

**Fix**: Remove dynamic import if component is already a client component

```tsx
// Before
const PostHogPageView = dynamic(
  () => import("../components/posthog-pageview"),
  { ssr: false }
);

// After
import PostHogPageView from "@/components/posthog-pageview"; // Already has 'use client'
```

### Issue 3: React.Children.only Error

**Error**: When using Button `asChild` with multiple children

**Fix**: Use `leftIcon` prop instead of `asChild`

```tsx
// Before
<Button asChild>
  <a href="...">
    <Icon />
    Text
  </a>
</Button>

// After  
<Button leftIcon={<Icon />} onClick={() => window.open('...')}>
  Text
</Button>
```

### Issue 4: LiveKit Context Not Available

**Error**: "No room provided, make sure you are inside a Room context"

**Fix**: Wrap entire app with `LiveKitRoom` (via `RoomWrapper`) in `layout.tsx`, ensuring sidebar and all components have access to context.

### Issue 5: Slider Invisible in Light Theme

**Cause**: Hardcoded dark theme colors

**Fix**: Use semantic tokens

```tsx
// Track
className="bg-separator2"  // was bg-neutral-100/20

// Range  
className="bg-fg2"  // was bg-neutral-900/30

// Thumb
className="border-separator1 bg-bg0"
```

### Issue 6: Gemini Logo Invisible in Light Theme

**Fix**: Add inversion

```tsx
className="dark:invert-0 invert"
```

### Issue 7: Sidebar Pushing Content Off-Screen

**Cause**: Using `variant="inset"` on Sidebar

**Fix**: Remove `variant` and `flex-1` className

```tsx
// Before
<Sidebar variant="inset" />
<SidebarInset className="flex-1" />

// After
<Sidebar />
<SidebarInset />
```

## Component Styling Patterns

### Form Fields

**Files**: Configuration selectors

```tsx
<FormItem className="flex flex-row items-center space-y-0 justify-between px-1">
  <FormLabel className="text-sm font-medium text-fg1">
    Label
  </FormLabel>
  <Select>
    <SelectTrigger>{/* ... */}</SelectTrigger>
  </Select>
</FormItem>
```

### Modal Sections

```tsx
// Header
<div className="px-6 py-5 border-b border-separator1">
  <h3 className="text-lg font-semibold text-fg0">Title</h3>
  <p className="text-sm text-fg2 mt-2">Description</p>
</div>

// Content
<div className="px-6 py-4">
  {/* Main content */}
</div>

// Footer  
<div className="px-6 py-4 bg-bg2 border-t border-separator1 rounded-b-lg">
  {/* Footer content */}
</div>
```

### Language Switcher Pattern

**File**: `web/src/components/code-viewer.tsx`

```tsx
<div className="flex gap-1 bg-bg2 p-1 rounded-lg">
  <Button
    variant={language === "python" ? "primary" : "ghost"}
    size="sm"
    onClick={() => setLanguage("python")}
  >
    Python
  </Button>
  <Button
    variant={language === "typescript" ? "primary" : "ghost"}
    size="sm"
    onClick={() => setLanguage("typescript")}
  >
    TypeScript
  </Button>
</div>
```

## Custom Components Created

### NavLogo Component

**File**: `web/src/components/custom/nav-logo.tsx`

Displays LiveKit wordmark SVG and Gemini logo side-by-side with separator.

### ThemeToggle Component  

**File**: `web/src/components/custom/theme-toggle.tsx`

Theme switcher with:

- Select dropdown when sidebar expanded
- Icon button with popover when sidebar collapsed
- Icons for each theme option (Sun, Moon, Monitor)

### RoomWrapper Component

**File**: `web/src/components/room-wrapper.tsx`

Wraps children with `LiveKitRoom` to provide context globally.

## File Structure

### Key Files Modified

- `web/src/app/layout.tsx` - Root layout with providers
- `web/src/app/page.tsx` - Main dashboard page
- `web/src/app/globals.css` - Tailwind v4 config and theme tokens
- `web/package.json` - Dependency versions
- `web/postcss.config.mjs` - PostCSS plugin config
- `web/src/components/ui/button.tsx` - Button component
- `web/src/components/ui/dialog.tsx` - Dialog component
- `web/src/components/ui/popover.tsx` - Popover component
- `web/src/components/ui/select.tsx` - Select component
- `web/src/components/ui/input.tsx` - Input component
- `web/src/components/ui/slider.tsx` - Slider component
- `web/src/components/ui/sidebar.tsx` - Sidebar component
- `web/src/components/code-viewer.tsx` - Code display modal with language switcher
- `web/src/components/preset-share.tsx` - Share preset popup
- `web/src/components/configuration-form.tsx` - Config form styling
- `web/src/components/session-controls.tsx` - Session controls styling
- `web/src/components/gemini.tsx` - Gemini logo with theme inversion

### Files Deleted

- `web/tailwind.config.ts` - Replaced by CSS-based config
- `web/src/components/room-component.tsx` - Contents moved to page.tsx
- `web/src/components/sidebar-config.tsx` - Consolidated

## Theme System

### ThemeProvider Integration

**File**: `web/src/app/layout.tsx`

```tsx
import { ThemeProvider } from "@/components/theme-provider";

<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
  {children}
</ThemeProvider>
```

### CSS Variables Pattern

Light and dark themes defined in `:root` and `.dark` selectors in `globals.css` with `light-dark()` function for automatic switching.

## Testing Checklist

### Visual Testing

- [ ] Light theme - all components visible
- [ ] Dark theme - all components visible  
- [ ] Slider track visible in both themes
- [ ] Logo rendering correctly in both themes
- [ ] Theme switcher readable in both themes
- [ ] Sidebar resize behavior (no content push)
- [ ] Modal/popover contrast and readability

### Functional Testing

- [ ] Configuration form updates
- [ ] Code viewer language switch
- [ ] Copy buttons work
- [ ] Share link generation
- [ ] Theme switching
- [ ] LiveKit connection (no context errors)

## Key Learnings

1. **Context Hierarchy Matters**: LiveKit context must wrap entire app, including sidebar components
2. **Semantic Tokens Scale**: Using `bg0-bg3` and `fg0-fg5` makes theme transitions seamless
3. **Tailwind v4 is CSS-First**: Configuration lives in CSS, not JS
4. **React 19 Breaking Changes**: Many libraries need updates for compatibility
5. **Button asChild Limitation**: Cannot have multiple children; use icon props instead
6. **Next.js 15 Async APIs**: Many props that were sync are now async (searchParams)
7. **Design System Consistency**: Having a shared component library (design-prototyping-kit) accelerates consistent UI development

## References

- LiveKit Agents Python: https://github.com/livekit/agents
- LiveKit Agents JS: https://github.com/livekit/agents-js
- Tailwind CSS v4: https://tailwindcss.com/docs
- Next.js 15: https://nextjs.org/docs
- React 19: https://react.dev/blog

## Migration Summary

Total files modified: ~25

Total lines changed: ~2000+

Key achievements:

- Successfully migrated to Next.js 15 + React 19
- Adopted Tailwind CSS v4
- Implemented comprehensive design system
- Added Python/TypeScript code examples
- Fixed all theme-related visual issues
- Improved component consistency and maintainability