# Frontend-Only Architecture for All You Can Cook

## Architecture Overview

The "All You Can Cook" app follows a **frontend-heavy** architecture where all cooking-specific business logic resides in the React frontend, while the backend remains minimal and unchanged from the original Gemini playground.

## System Components

### Frontend (React/Next.js) - All Cooking Logic
```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Client-Side)               │
├─────────────────────────────────────────────────────────┤
│  Recipe Management                                      │
│  ├── Recipe Loading & Storage (localStorage/IndexedDB) │
│  ├── Recipe Validation & Parsing                       │
│  ├── Ingredient Management                             │
│  └── Recipe Search & Filtering                         │
├─────────────────────────────────────────────────────────┤
│  Cooking Session Management                             │
│  ├── Step Navigation & Tracking                        │
│  ├── Progress Persistence                              │
│  ├── Cooking State Management                          │
│  └── Session Recovery                                  │
├─────────────────────────────────────────────────────────┤
│  Kitchen Tools                                          │
│  ├── Multiple Timer Management                         │
│  ├── Measurement Conversions                           │
│  ├── Voice Command Processing                          │
│  └── Notification System                               │
├─────────────────────────────────────────────────────────┤
│  Acai AI Integration                                    │
│  ├── Context Preparation                               │
│  ├── Recipe-Aware Prompts                              │
│  ├── Response Processing                               │
│  └── Voice Interaction                                 │
└─────────────────────────────────────────────────────────┘
```

### Backend (Node.js/Python) - Minimal & Unchanged
```
┌─────────────────────────────────────────────────────────┐
│                BACKEND (Server-Side)                    │
├─────────────────────────────────────────────────────────┤
│  Token Generation API                                   │
│  ├── Environment API Key Loading                       │
│  ├── LiveKit Token Creation                            │
│  └── WebSocket Connection Setup                        │
├─────────────────────────────────────────────────────────┤
│  LiveKit Agent (Python)                                │
│  ├── WebSocket Audio Streaming                         │
│  ├── Gemini API Integration                            │
│  └── Voice Processing                                  │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### Recipe Context Flow
```
Frontend Recipe Data
        ↓
Frontend Context Formatter
        ↓
AI Instructions Template
        ↓
WebSocket to LiveKit Agent
        ↓
Gemini API with Recipe Context
        ↓
AI Response back to Frontend
```

### Cooking Session Flow
```
User Starts Cooking
        ↓
Frontend Loads Recipe (localStorage)
        ↓
Frontend Manages Step Navigation
        ↓
Frontend Creates AI Context
        ↓
Voice Interaction via WebSocket
        ↓
Frontend Processes AI Responses
        ↓
Frontend Updates UI & State
```

### Timer Management Flow
```
Recipe Step with Timer
        ↓
Frontend Creates Timer (Web APIs)
        ↓
Browser Notification System
        ↓
Frontend Updates UI
        ↓
Timer Completion Handled Locally
```

## Key Benefits of Frontend-Only Approach

### 1. **Simplified Backend**
- No cooking-specific backend code
- Original LiveKit agent remains unchanged
- Easier deployment and maintenance
- No database setup required

### 2. **Offline Capability**
- Recipes stored in browser storage
- Timers work offline
- Core cooking functionality available without connection
- Only AI chat requires internet

### 3. **Fast Response Times**
- No server round-trips for recipe data
- Instant step navigation
- Local timer management
- Immediate UI updates

### 4. **Scalability**
- No backend cooking logic to scale
- Client-side processing distributes load
- Static recipe assets can be cached
- Minimal server resources needed

### 5. **Development Simplicity**
- Single-team frontend development
- No backend API design needed
- Easier testing and debugging
- Faster iteration cycles

## Implementation Strategy

### Phase 1: Frontend Recipe System
```typescript
// All recipe logic in frontend
interface RecipeManager {
  loadRecipe: (id: string) => Promise<Recipe>;
  saveRecipe: (recipe: Recipe) => void;
  validateRecipe: (recipe: Recipe) => ValidationResult;
  searchRecipes: (query: string) => Recipe[];
}

// Browser storage for persistence
class RecipeStorage {
  private storage = localStorage; // or IndexedDB for large data
  
  save(recipe: Recipe): void {
    this.storage.setItem(`recipe-${recipe.id}`, JSON.stringify(recipe));
  }
  
  load(id: string): Recipe | null {
    const data = this.storage.getItem(`recipe-${id}`);
    return data ? JSON.parse(data) : null;
  }
}
```

### Phase 2: Frontend Cooking Session
```typescript
// Cooking session management in React state
function useCookingSession(recipe: Recipe) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeTimers, setActiveTimers] = useState<Timer[]>([]);
  
  // All cooking logic handled in frontend hooks
  const nextStep = () => setCurrentStep(prev => prev + 1);
  const previousStep = () => setCurrentStep(prev => Math.max(0, prev - 1));
  const completeStep = (stepNumber: number) => {
    setCompletedSteps(prev => [...prev, stepNumber]);
  };
  
  return { currentStep, completedSteps, activeTimers, nextStep, previousStep, completeStep };
}
```

### Phase 3: Frontend AI Context
```typescript
// AI context preparation in frontend
function prepareAcaiContext(recipe: Recipe, session: CookingSession): string {
  return `
CURRENT RECIPE: ${recipe.title}
CURRENT STEP: ${session.currentStep + 1} of ${recipe.steps.length}
STEP INSTRUCTION: ${recipe.steps[session.currentStep]?.instruction}
ACTIVE TIMERS: ${session.activeTimers.map(t => t.name).join(', ')}
COMPLETED STEPS: ${session.completedSteps.join(', ')}

You are Acai, helping the user cook this recipe. Focus on the current step and provide cooking guidance.
`;
}

// Pass context through existing WebSocket connection
function sendContextToAcai(context: string) {
  // Use existing LiveKit connection to send updated instructions
  // No backend changes needed
}
```

## File Organization

### Frontend Files (New/Modified)
```
web/src/
├── components/cooking/
│   ├── RecipeViewer.tsx
│   ├── CookingStepGuide.tsx
│   ├── KitchenTimer.tsx
│   └── AcaiCookingChat.tsx
├── hooks/
│   ├── useCookingSession.ts
│   ├── useRecipeManager.ts
│   ├── useKitchenTimer.ts
│   └── useAcaiContext.ts
├── data/
│   ├── recipes.ts (sample recipes)
│   ├── cooking-knowledge.ts
│   └── acai-preset.ts
└── utils/
    ├── recipe-parser.ts
    ├── cooking-helpers.ts
    └── measurement-converter.ts
```

### Backend Files (Minimal Changes)
```
web/src/app/api/token/route.ts  # Only change: use env API key
agent/                          # Completely unchanged
```

## Migration Path

1. **Keep Backend As-Is**: No changes to Python agent or LiveKit setup
2. **Frontend Recipe System**: Build recipe management in React
3. **Frontend Cooking Logic**: Implement step tracking and timers
4. **AI Context Integration**: Pass recipe data through existing WebSocket
5. **UI Enhancement**: Build cooking-focused interface
6. **Testing**: Verify all cooking features work client-side

This approach maintains the simplicity of the original architecture while adding all the cooking-specific functionality where it's most appropriate - in the frontend where users interact with recipes and cooking tools.
