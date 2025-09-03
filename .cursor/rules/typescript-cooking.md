# TypeScript Rules for All You Can Cook

## Core Type Definitions

### Recipe Types
Always use these standardized types for recipe-related data:

```typescript
// Core recipe structure
interface Recipe {
  id: string;
  title: string;
  description: string;
  servings: number;
  prepTime: number; // minutes
  cookTime: number; // minutes
  totalTime: number; // minutes (calculated)
  difficulty: RecipeDifficulty;
  cuisine?: string;
  ingredients: Ingredient[];
  steps: CookingStep[];
  tags: string[];
  nutrition?: NutritionInfo;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Ingredient specification
interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: MeasurementUnit;
  preparation?: string; // "diced", "minced", "chopped"
  notes?: string;
  isOptional?: boolean;
  category?: IngredientCategory;
}

// Cooking step details
interface CookingStep {
  stepNumber: number;
  instruction: string;
  duration?: number; // minutes
  temperature?: Temperature;
  equipment?: string[];
  tips?: string[];
  warnings?: string[];
  imageUrl?: string;
}

// Enums for consistency
enum RecipeDifficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
  EXPERT = 'Expert'
}

enum MeasurementUnit {
  // Volume
  TEASPOON = 'tsp',
  TABLESPOON = 'tbsp',
  CUP = 'cup',
  MILLILITER = 'ml',
  LITER = 'l',
  FLUID_OUNCE = 'fl oz',
  
  // Weight
  GRAM = 'g',
  KILOGRAM = 'kg',
  OUNCE = 'oz',
  POUND = 'lb',
  
  // Count
  PIECE = 'piece',
  CLOVE = 'clove',
  SLICE = 'slice',
  
  // Other
  PINCH = 'pinch',
  DASH = 'dash',
  TO_TASTE = 'to taste'
}

enum IngredientCategory {
  PROTEIN = 'protein',
  VEGETABLE = 'vegetable',
  FRUIT = 'fruit',
  GRAIN = 'grain',
  DAIRY = 'dairy',
  SPICE = 'spice',
  HERB = 'herb',
  CONDIMENT = 'condiment',
  BAKING = 'baking',
  OTHER = 'other'
}

interface Temperature {
  value: number;
  unit: 'celsius' | 'fahrenheit';
}

interface NutritionInfo {
  calories: number;
  protein: number; // grams
  carbohydrates: number; // grams
  fat: number; // grams
  fiber?: number; // grams
  sugar?: number; // grams
  sodium?: number; // mg
}
```

### Cooking Session Types
```typescript
interface CookingSession {
  id: string;
  recipeId: string;
  currentStep: number;
  startTime: Date;
  pausedAt?: Date;
  completedSteps: number[];
  activeTimers: CookingTimer[];
  notes: string[];
  status: CookingSessionStatus;
}

enum CookingSessionStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned'
}

interface CookingTimer {
  id: string;
  name: string;
  duration: number; // seconds
  remaining: number; // seconds
  isActive: boolean;
  createdAt: Date;
  stepNumber?: number;
}
```

### Acai AI Types
```typescript
interface AcaiResponse {
  text: string;
  audioUrl?: string;
  suggestions?: string[];
  relatedSteps?: number[];
  timers?: TimerSuggestion[];
  warnings?: string[];
}

interface TimerSuggestion {
  name: string;
  duration: number; // minutes
  reason: string;
}

enum AcaiResponseType {
  STEP_GUIDANCE = 'step_guidance',
  INGREDIENT_INFO = 'ingredient_info',
  TECHNIQUE_HELP = 'technique_help',
  SAFETY_WARNING = 'safety_warning',
  ENCOURAGEMENT = 'encouragement',
  ERROR_HELP = 'error_help'
}
```

## Naming Conventions

### Variables and Functions
- Use cooking-specific terminology
- Be descriptive and clear
- Use camelCase for variables and functions

```typescript
// Good
const currentRecipe: Recipe = ...;
const activeCookingSession: CookingSession = ...;
const remainingCookTime: number = ...;

function startCookingSession(recipe: Recipe): CookingSession { ... }
function addCookingTimer(name: string, duration: number): void { ... }
function moveToNextStep(): void { ... }

// Bad
const data: any = ...;
const session: object = ...;
const time: number = ...;

function start(r: any): any { ... }
function add(n: string, d: number): void { ... }
function next(): void { ... }
```

### Components
- Use PascalCase
- Include cooking context in names
- Be specific about component purpose

```typescript
// Good
const RecipeCard: React.FC<RecipeCardProps> = ...;
const CookingStepGuide: React.FC<CookingStepGuideProps> = ...;
const AcaiChatInterface: React.FC<AcaiChatProps> = ...;
const KitchenTimerPanel: React.FC<TimerPanelProps> = ...;

// Bad
const Card: React.FC = ...;
const Guide: React.FC = ...;
const Chat: React.FC = ...;
const Panel: React.FC = ...;
```

## Error Handling

### Cooking-Specific Error Types
```typescript
class CookingError extends Error {
  constructor(
    message: string,
    public readonly code: CookingErrorCode,
    public readonly step?: number,
    public readonly ingredient?: string
  ) {
    super(message);
    this.name = 'CookingError';
  }
}

enum CookingErrorCode {
  RECIPE_NOT_FOUND = 'RECIPE_NOT_FOUND',
  INVALID_STEP = 'INVALID_STEP',
  TIMER_ERROR = 'TIMER_ERROR',
  INGREDIENT_MISSING = 'INGREDIENT_MISSING',
  TEMPERATURE_INVALID = 'TEMPERATURE_INVALID',
  ACAI_CONNECTION_ERROR = 'ACAI_CONNECTION_ERROR'
}

// Usage
function validateCookingStep(step: CookingStep, stepNumber: number): void {
  if (!step.instruction.trim()) {
    throw new CookingError(
      'Cooking step cannot be empty',
      CookingErrorCode.INVALID_STEP,
      stepNumber
    );
  }
}
```

## Type Guards and Validation

### Recipe Validation
```typescript
function isValidRecipe(data: unknown): data is Recipe {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'title' in data &&
    'ingredients' in data &&
    'steps' in data &&
    Array.isArray((data as any).ingredients) &&
    Array.isArray((data as any).steps)
  );
}

function isValidIngredient(data: unknown): data is Ingredient {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    'amount' in data &&
    'unit' in data &&
    typeof (data as any).name === 'string' &&
    typeof (data as any).amount === 'number' &&
    Object.values(MeasurementUnit).includes((data as any).unit)
  );
}
```

## Utility Types

### Recipe Manipulation
```typescript
type RecipePreview = Pick<Recipe, 'id' | 'title' | 'description' | 'difficulty' | 'totalTime' | 'imageUrl'>;

type CookingStepWithIngredients = CookingStep & {
  requiredIngredients: Ingredient[];
};

type RecipeWithProgress = Recipe & {
  progress: {
    completedSteps: number[];
    currentStep: number;
    percentComplete: number;
  };
};

// Utility type for API responses
type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
  code: string;
};

type RecipeApiResponse = ApiResponse<Recipe>;
type RecipeListApiResponse = ApiResponse<RecipePreview[]>;
```

## Component Props Patterns

### Standard Props Interfaces
```typescript
interface BaseComponentProps {
  className?: string;
  'data-testid'?: string;
}

interface RecipeCardProps extends BaseComponentProps {
  recipe: RecipePreview;
  onSelect: (recipeId: string) => void;
  isSelected?: boolean;
}

interface CookingStepGuideProps extends BaseComponentProps {
  recipe: Recipe;
  currentStep: number;
  onStepComplete: (stepNumber: number) => void;
  onStepChange: (stepNumber: number) => void;
}

interface AcaiChatProps extends BaseComponentProps {
  recipe: Recipe;
  currentStep: number;
  onTimerRequest: (timer: TimerSuggestion) => void;
  onStepNavigation: (direction: 'next' | 'previous') => void;
}
```

## Async Patterns

### Recipe and Cooking Operations
```typescript
// Use proper async/await with error handling
async function loadRecipe(recipeId: string): Promise<Recipe> {
  try {
    const response = await fetch(`/api/recipes/${recipeId}`);
    if (!response.ok) {
      throw new CookingError(
        `Failed to load recipe: ${response.statusText}`,
        CookingErrorCode.RECIPE_NOT_FOUND
      );
    }
    
    const data = await response.json();
    if (!isValidRecipe(data)) {
      throw new CookingError(
        'Invalid recipe data received',
        CookingErrorCode.RECIPE_NOT_FOUND
      );
    }
    
    return data;
  } catch (error) {
    if (error instanceof CookingError) {
      throw error;
    }
    throw new CookingError(
      'Network error while loading recipe',
      CookingErrorCode.RECIPE_NOT_FOUND
    );
  }
}

// Hook pattern for cooking operations
function useCookingSession(recipeId: string) {
  const [session, setSession] = useState<CookingSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<CookingError | null>(null);
  
  const startCooking = useCallback(async (recipe: Recipe) => {
    setLoading(true);
    setError(null);
    
    try {
      const newSession = await createCookingSession(recipe);
      setSession(newSession);
    } catch (err) {
      setError(err instanceof CookingError ? err : new CookingError(
        'Failed to start cooking session',
        CookingErrorCode.ACAI_CONNECTION_ERROR
      ));
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { session, loading, error, startCooking };
}
```

## Testing Types

```typescript
// Test data factories
function createMockRecipe(overrides?: Partial<Recipe>): Recipe {
  return {
    id: 'test-recipe-1',
    title: 'Test Recipe',
    description: 'A test recipe for unit testing',
    servings: 4,
    prepTime: 15,
    cookTime: 30,
    totalTime: 45,
    difficulty: RecipeDifficulty.EASY,
    ingredients: [createMockIngredient()],
    steps: [createMockCookingStep()],
    tags: ['test'],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}

function createMockIngredient(overrides?: Partial<Ingredient>): Ingredient {
  return {
    id: 'test-ingredient-1',
    name: 'Test Ingredient',
    amount: 1,
    unit: MeasurementUnit.CUP,
    category: IngredientCategory.OTHER,
    ...overrides
  };
}

// Test helper types
type MockRecipeOptions = {
  stepCount?: number;
  ingredientCount?: number;
  difficulty?: RecipeDifficulty;
};
```
