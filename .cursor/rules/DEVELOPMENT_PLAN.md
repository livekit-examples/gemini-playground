# All You Can Cook - Development Plan

## Project Overview
Transform the Gemini Multimodal Live Playground into "All You Can Cook" - an AI cooking assistant app featuring "Acai", a helpful cooking guide that provides interactive voice assistance during cooking sessions.

## Phase 1: Core Infrastructure Migration (Week 1-2)

### 1.1 Environment Configuration
- [ ] **Migrate API Key Management**
  - Remove user API key input from auth components
  - Load `GEMINI_API_KEY` from environment variables
  - Update token generation API to use env variable
  - Update Docker configuration and deployment scripts

- [ ] **Project Rebranding**
  - Update package.json name and description
  - Change app title and meta tags
  - Update README.md with cooking app description
  - Replace Gemini branding with "All You Can Cook" branding

### 1.2 AI Preset Simplification
- [ ] **Remove Existing Presets**
  - Delete all current presets from `web/src/data/presets.ts`
  - Remove preset selection UI components
  - Simplify state management to single preset mode

- [ ] **Create Acai Cooking Assistant Preset**
  - Design comprehensive cooking assistant instructions
  - Include recipe understanding capabilities
  - Add cooking safety guidelines
  - Implement kitchen-appropriate response style

## Phase 2: Frontend Recipe Integration System (Week 3-4)

### 2.1 Recipe Data Structure (Frontend Only)
- [ ] **Define Recipe Schema**
  ```typescript
  interface Recipe {
    id: string;
    title: string;
    description: string;
    servings: number;
    prepTime: number; // minutes
    cookTime: number; // minutes
    difficulty: 'Easy' | 'Medium' | 'Hard';
    ingredients: Ingredient[];
    steps: CookingStep[];
    tags: string[];
    nutrition?: NutritionInfo;
  }
  
  interface Ingredient {
    name: string;
    amount: number;
    unit: string;
    notes?: string;
  }
  
  interface CookingStep {
    stepNumber: number;
    instruction: string;
    duration?: number; // minutes
    temperature?: number; // celsius
    tips?: string[];
  }
  ```

- [ ] **Frontend Recipe Management System**
  - Create recipe loading hooks (frontend state management)
  - Implement recipe validation (client-side)
  - Add recipe storage (localStorage/IndexedDB)
  - Build recipe selection and display components

### 2.2 Frontend AI Recipe Integration
- [ ] **Recipe Context System (Client-Side)**
  - Pass recipe data to Acai through session instructions
  - Format recipe information for AI context
  - Create recipe-aware conversation prompts
  - Handle recipe context updates in real-time

- [ ] **Frontend Cooking Session Management**
  - Track current cooking step (React state)
  - Handle step navigation (next, previous, repeat)
  - Implement cooking timers (frontend-only)
  - Add progress persistence (localStorage)
  - Build cooking session UI components

## Phase 3: Acai AI Assistant (Week 5-6)

### 3.1 AI Personality Development
- [ ] **Acai Character Design**
  - Friendly, encouraging, patient personality
  - Kitchen safety awareness
  - Cooking technique expertise
  - Appropriate response boundaries (cooking-only)

- [ ] **Cooking Knowledge Base**
  - Ingredient substitutions database
  - Cooking techniques explanations
  - Temperature and timing guidelines
  - Common cooking troubleshooting

### 3.2 Voice Interaction Optimization
- [ ] **Kitchen-Specific Voice Commands**
  - "Next step" / "Previous step"
  - "Repeat that" / "Say again"
  - "Set timer for X minutes"
  - "How long do I cook this?"
  - "What's the next ingredient?"

- [ ] **Response Optimization**
  - Clear, concise instructions
  - Hands-free friendly responses
  - Safety reminders when appropriate
  - Encouragement and cooking tips

## Phase 4: Cooking Interface Design (Week 7-8)

### 4.1 Recipe Display Components
- [ ] **Recipe Overview Component**
  - Ingredient list with checkboxes
  - Cooking time and servings info
  - Difficulty and tags display
  - Prep instructions summary

- [ ] **Step-by-Step Interface**
  - Large, readable current step display
  - Progress indicator
  - Navigation controls
  - Timer integration

### 4.2 Kitchen-Friendly UI
- [ ] **Large Touch Targets**
  - Big buttons for dirty hands
  - Voice activation buttons
  - Emergency stop/pause functionality

- [ ] **Visual Hierarchy**
  - Current step prominence
  - Active timers display
  - Ingredient status tracking
  - Clear visual feedback

## Phase 5: Advanced Cooking Features (Week 9-10)

### 5.1 Frontend Timer Management
- [ ] **Multiple Timer Support (Client-Side)**
  - Named timers for different cooking tasks (React state)
  - Visual and audio alerts (Web APIs)
  - Timer persistence across sessions (localStorage)
  - Timer component with notifications

- [ ] **Smart Timer Integration**
  - Frontend logic to suggest timers based on recipe steps
  - Timer creation from recipe step data
  - Visual timer indicators in cooking interface

### 5.2 Frontend Cooking Assistance Features
- [ ] **Ingredient Substitutions (Client-Side)**
  - Frontend database of ingredient substitutions
  - Recipe modification suggestions
  - Dietary restriction filtering
  - Measurement conversion utilities

- [ ] **Cooking Troubleshooting (Client-Side)**
  - Frontend troubleshooting knowledge base
  - Context-aware help suggestions
  - Recipe recovery guidance
  - Step-by-step problem resolution

## Phase 6: Testing & Polish (Week 11-12)

### 6.1 User Experience Testing
- [ ] **Kitchen Environment Testing**
  - Test with actual cooking scenarios
  - Voice recognition in noisy environments
  - Mobile device usability while cooking

- [ ] **Recipe Testing**
  - Test with various recipe complexities
  - Validate AI guidance accuracy
  - Ensure step-by-step flow works smoothly

### 6.2 Performance & Reliability
- [ ] **Response Time Optimization**
  - Minimize AI response latency
  - Optimize recipe loading
  - Implement proper error handling

- [ ] **Session Persistence**
  - Save cooking progress
  - Resume interrupted sessions
  - Handle connection interruptions gracefully

## Technical Implementation Details

### Environment Variables Setup (Backend Only)
```bash
# .env.local (Backend environment variables only)
GEMINI_API_KEY=your_gemini_api_key_here
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_secret
LIVEKIT_URL=your_livekit_url

# No cooking-specific backend variables needed
# All cooking logic handled in frontend
```

### Frontend-Only Architecture
```bash
# All cooking features implemented as:
# - React components and hooks
# - Client-side state management
# - localStorage for persistence
# - Frontend data processing
# - Browser APIs for timers and notifications
```

### Key Files to Modify

#### Frontend Changes
- `web/src/components/auth.tsx` - Remove API key input
- `web/src/data/presets.ts` - Replace with single Acai preset
- `web/src/data/playground-state.ts` - Simplify for cooking app
- `web/src/hooks/use-playground-state.tsx` - Remove preset selection logic

#### Backend Changes (Minimal)
- `web/src/app/api/token/route.ts` - Use environment API key only
- Backend remains unchanged - no cooking logic added

### New Components to Create
- `RecipeViewer` - Display recipe information
- `CookingStepGuide` - Step-by-step cooking interface
- `AcaiChat` - Cooking-focused chat interface
- `KitchenTimer` - Multiple timer management
- `IngredientChecklist` - Track ingredient usage

## Success Metrics
- AI provides accurate cooking guidance
- Users can complete recipes with voice assistance
- App works effectively in kitchen environment
- Cooking sessions can be paused and resumed
- Safety warnings are appropriately provided

## Future Enhancements (Post-MVP)
- Recipe database integration
- User profile and preferences
- Shopping list generation
- Meal planning features
- Recipe sharing and rating
- Multi-language support
- Offline recipe access
- Integration with smart kitchen devices
