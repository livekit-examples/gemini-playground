# All You Can Cook - Development Rules

## Project Overview
Transform the Gemini Multimodal Live Playground into "All You Can Cook" - an AI cooking assistant app featuring "Acai", a helpful cooking guide that provides interactive voice assistance during cooking sessions.

## Core Development Principles

### 1. Kitchen-First Design
- **Audio-First Interface**: Prioritize voice interactions since users will have messy hands while cooking
- **Clear Communication**: All AI responses must be precise, concise, and kitchen-appropriate
- **Safety Focus**: Include cooking safety reminders and warnings when appropriate
- **Timer Integration**: Support for multiple cooking timers and time-sensitive instructions

### 2. AI Assistant "Acai" Personality
- **Name**: Always refer to the AI as "Acai" (pronounced "Ah-sigh")
- **Personality**: Friendly, encouraging, patient, and knowledgeable about cooking
- **Scope**: Strictly cooking-related responses only - politely deflect non-cooking questions
- **Expertise**: Knowledgeable about ingredients, techniques, substitutions, and cooking safety

### 3. Code Organization

#### Frontend Structure (All Logic Client-Side)
```
web/src/
├── components/
│   ├── cooking/          # Cooking-specific components
│   ├── recipe/           # Recipe display and management
│   ├── acai/             # AI assistant components
│   └── kitchen/          # Kitchen tools (timers, measurements)
├── data/
│   ├── recipes/          # Recipe data and schemas (frontend)
│   ├── cooking-presets/  # Acai personality presets (frontend)
│   ├── ingredients/      # Ingredient database (frontend)
│   └── cooking-knowledge/ # Cooking tips, substitutions (frontend)
├── hooks/
│   ├── use-recipe/       # Recipe management hooks
│   ├── use-cooking-session/ # Cooking session state
│   ├── use-acai/         # Acai AI assistant hooks
│   └── use-kitchen-timer/ # Timer management hooks
└── utils/
    ├── recipe-parser/    # Recipe parsing utilities
    ├── cooking-helpers/  # Cooking guidance functions
    ├── timer-manager/    # Multiple timer management
    └── measurement-converter/ # Unit conversions
```

#### Backend Structure (Minimal - Unchanged)
```
agent/
├── main.py              # Original agent code (unchanged)
├── requirements.txt     # Original dependencies (unchanged)
└── Dockerfile          # Original Docker setup (unchanged)

web/src/app/api/
└── token/
    └── route.ts         # Only change: use env API key
```

### 4. Naming Conventions
- **Components**: Use descriptive cooking-related names (e.g., `RecipeCard`, `CookingTimer`, `AcaiChat`)
- **Functions**: Use cooking verbs (e.g., `startCooking`, `addIngredient`, `setTimer`)
- **Variables**: Use kitchen terminology (e.g., `currentStep`, `ingredients`, `cookingTime`)

### 5. Environment & Configuration
- **API Keys**: Backend environment variables only, never user input
- **Recipe Storage**: Frontend localStorage/IndexedDB, no backend database
- **Offline Support**: Full offline functionality with cached recipes
- **Multi-language**: Frontend-only internationalization

### 6. User Experience Guidelines
- **Progressive Disclosure**: Show information as needed during cooking steps
- **Large Touch Targets**: Design for users with wet/dirty hands
- **Voice Commands**: Implement common cooking voice commands ("next step", "repeat", "set timer")
- **Visual Hierarchy**: Important information (timers, current step) should be prominent

### 7. Performance & Reliability
- **Fast Response**: AI responses should be immediate for cooking urgency
- **Offline Graceful Degradation**: Core recipe viewing should work offline
- **Error Handling**: Clear error messages with cooking-appropriate suggestions
- **Session Persistence**: Don't lose cooking progress on accidental refresh

### 8. Testing Strategy
- **Recipe Testing**: Test with various recipe formats and complexities
- **Voice Testing**: Test in noisy kitchen environments
- **Accessibility**: Ensure screen reader compatibility for visually impaired cooks
- **Mobile First**: Primary testing on mobile devices

### 9. Security & Privacy
- **Recipe Privacy**: User's cooking history should remain private
- **API Security**: Secure handling of Gemini API keys
- **Data Minimization**: Only collect necessary cooking-related data

### 10. Future Considerations
- **Recipe Database**: Plan for integration with recipe APIs or databases
- **User Profiles**: Dietary restrictions, preferences, skill levels
- **Shopping Lists**: Integration with grocery services
- **Meal Planning**: Weekly meal planning features
- **Community**: Recipe sharing and rating system

## Code Quality Standards

### TypeScript
- Use strict typing for all recipe and cooking-related data structures
- Define clear interfaces for Recipe, Ingredient, CookingStep, etc.
- Use enums for cooking-related constants (MeasurementUnits, CookingMethods, etc.)

### React Components
- Keep cooking-related state at appropriate levels
- Use custom hooks for cooking logic
- Implement proper error boundaries for cooking sessions

### Python Agent
- Use type hints for all cooking-related functions
- Implement proper error handling for recipe parsing
- Use async/await for all AI interactions

### Documentation
- Document all cooking-related functions and components
- Include recipe format specifications
- Maintain cooking safety guidelines

## Git Workflow
- **Branch Naming**: `feature/cooking-[feature-name]`, `fix/acai-[issue]`
- **Commit Messages**: Use cooking terminology ("Add recipe parsing", "Fix timer display")
- **PR Reviews**: Focus on cooking UX and AI response quality

## Deployment
- **Environment Variables**: Document all required environment variables
- **Recipe Data**: Plan for recipe data migration and updates
- **AI Model**: Ensure consistent Acai personality across deployments
