# React Component Rules for All You Can Cook

## Component Architecture Principles

### Kitchen-First Design
- **Large Touch Targets**: Minimum 44px touch targets for users with wet/dirty hands
- **High Contrast**: Ensure readability in various kitchen lighting conditions
- **Voice-First**: Components should work primarily through voice commands
- **Interruption-Safe**: Handle cooking interruptions gracefully (phone calls, doorbell)

### Component Hierarchy
```
App
├── CookingLayout
│   ├── RecipeHeader
│   ├── AcaiAssistant
│   ├── CookingMainContent
│   │   ├── RecipeOverview (pre-cooking)
│   │   ├── CookingStepGuide (during cooking)
│   │   └── CookingComplete (post-cooking)
│   └── KitchenToolbar
│       ├── TimerPanel
│       ├── VoiceControls
│       └── EmergencyStop
```

## Component Standards

### Base Component Pattern
```tsx
interface BaseComponentProps {
  className?: string;
  'data-testid'?: string;
  children?: React.ReactNode;
}

interface CookingComponentProps extends BaseComponentProps {
  onVoiceCommand?: (command: VoiceCommand) => void;
  isVoiceEnabled?: boolean;
  priority?: 'high' | 'medium' | 'low'; // For voice command priority
}

// Example base cooking component
const CookingComponent: React.FC<CookingComponentProps> = ({
  className,
  'data-testid': testId,
  children,
  onVoiceCommand,
  isVoiceEnabled = true,
  priority = 'medium'
}) => {
  return (
    <div
      className={cn('cooking-component', className)}
      data-testid={testId}
      data-voice-enabled={isVoiceEnabled}
      data-voice-priority={priority}
    >
      {children}
    </div>
  );
};
```

### Recipe Display Components

#### RecipeCard Component
```tsx
interface RecipeCardProps extends CookingComponentProps {
  recipe: RecipePreview;
  onSelect: (recipeId: string) => void;
  isSelected?: boolean;
  showNutrition?: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onSelect,
  isSelected = false,
  showNutrition = false,
  className,
  ...props
}) => {
  const handleSelect = useCallback(() => {
    onSelect(recipe.id);
  }, [onSelect, recipe.id]);

  return (
    <Card
      className={cn(
        'recipe-card cursor-pointer transition-all duration-200',
        'hover:shadow-lg hover:scale-[1.02]',
        'focus:ring-2 focus:ring-cooking-primary focus:outline-none',
        'min-h-[120px] p-4', // Large touch target
        isSelected && 'ring-2 ring-cooking-primary bg-cooking-primary/5',
        className
      )}
      onClick={handleSelect}
      onKeyDown={(e) => e.key === 'Enter' && handleSelect()}
      tabIndex={0}
      role="button"
      aria-selected={isSelected}
      {...props}
    >
      <div className="flex gap-4">
        {recipe.imageUrl && (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{recipe.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {recipe.description}
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="secondary">{recipe.difficulty}</Badge>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {recipe.totalTime}min
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
```

#### CookingStepGuide Component
```tsx
interface CookingStepGuideProps extends CookingComponentProps {
  recipe: Recipe;
  currentStep: number;
  onStepChange: (stepNumber: number) => void;
  onStepComplete: (stepNumber: number) => void;
  isAcaiSpeaking?: boolean;
}

const CookingStepGuide: React.FC<CookingStepGuideProps> = ({
  recipe,
  currentStep,
  onStepChange,
  onStepComplete,
  isAcaiSpeaking = false,
  className,
  ...props
}) => {
  const step = recipe.steps[currentStep - 1];
  const isLastStep = currentStep === recipe.steps.length;
  const isFirstStep = currentStep === 1;

  const handleNextStep = useCallback(() => {
    if (!isLastStep) {
      onStepChange(currentStep + 1);
    }
  }, [currentStep, isLastStep, onStepChange]);

  const handlePreviousStep = useCallback(() => {
    if (!isFirstStep) {
      onStepChange(currentStep - 1);
    }
  }, [currentStep, isFirstStep, onStepChange]);

  const handleCompleteStep = useCallback(() => {
    onStepComplete(currentStep);
    if (!isLastStep) {
      handleNextStep();
    }
  }, [currentStep, isLastStep, onStepComplete, handleNextStep]);

  return (
    <div className={cn('cooking-step-guide', className)} {...props}>
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Step {currentStep} of {recipe.steps.length}</span>
          <span>{Math.round((currentStep / recipe.steps.length) * 100)}% Complete</span>
        </div>
        <Progress value={(currentStep / recipe.steps.length) * 100} className="h-2" />
      </div>

      {/* Current Step */}
      <Card className="mb-6 p-6 bg-cooking-primary/5 border-cooking-primary/20">
        <div className="flex items-start gap-4">
          <Badge variant="outline" className="text-lg px-3 py-1 flex-shrink-0">
            {currentStep}
          </Badge>
          <div className="flex-1">
            <p className="text-lg leading-relaxed mb-4">{step.instruction}</p>
            
            {/* Step Details */}
            {(step.duration || step.temperature) && (
              <div className="flex gap-4 mb-4">
                {step.duration && (
                  <div className="flex items-center gap-2 text-sm">
                    <Timer className="w-4 h-4" />
                    <span>{step.duration} minutes</span>
                  </div>
                )}
                {step.temperature && (
                  <div className="flex items-center gap-2 text-sm">
                    <Thermometer className="w-4 h-4" />
                    <span>{step.temperature.value}°{step.temperature.unit === 'celsius' ? 'C' : 'F'}</span>
                  </div>
                )}
              </div>
            )}

            {/* Tips and Warnings */}
            {step.tips && step.tips.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Tips
                </h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {step.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {step.warnings && step.warnings.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                  Safety Warnings
                </h4>
                <ul className="list-disc list-inside text-sm space-y-1 text-amber-700">
                  {step.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Navigation Controls */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePreviousStep}
          disabled={isFirstStep || isAcaiSpeaking}
          className="flex-1 h-14" // Large touch target
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Previous
        </Button>
        
        <Button
          size="lg"
          onClick={handleCompleteStep}
          disabled={isAcaiSpeaking}
          className={cn(
            'flex-1 h-14', // Large touch target
            isLastStep ? 'bg-green-600 hover:bg-green-700' : ''
          )}
        >
          {isLastStep ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Complete Recipe
            </>
          ) : (
            <>
              <ChevronRight className="w-5 h-5 mr-2" />
              Next Step
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
```

### Acai Assistant Components

#### AcaiChatInterface Component
```tsx
interface AcaiChatInterfaceProps extends CookingComponentProps {
  recipe: Recipe;
  currentStep: number;
  isConnected: boolean;
  isSpeaking: boolean;
  onVoiceToggle: () => void;
  onEmergencyStop: () => void;
}

const AcaiChatInterface: React.FC<AcaiChatInterfaceProps> = ({
  recipe,
  currentStep,
  isConnected,
  isSpeaking,
  onVoiceToggle,
  onEmergencyStop,
  className,
  ...props
}) => {
  const [isListening, setIsListening] = useState(false);

  return (
    <Card className={cn('acai-chat-interface p-6', className)} {...props}>
      {/* Acai Status */}
      <div className="flex items-center gap-3 mb-6">
        <div className={cn(
          'w-3 h-3 rounded-full',
          isConnected ? 'bg-green-500' : 'bg-red-500'
        )} />
        <h3 className="font-semibold">Acai - Your Cooking Assistant</h3>
        {isSpeaking && (
          <Badge variant="secondary" className="animate-pulse">
            Speaking...
          </Badge>
        )}
      </div>

      {/* Voice Controls */}
      <div className="flex gap-3 mb-6">
        <Button
          variant={isListening ? "destructive" : "default"}
          size="lg"
          onClick={onVoiceToggle}
          disabled={!isConnected}
          className="flex-1 h-14" // Large touch target
        >
          <Mic className={cn(
            'w-5 h-5 mr-2',
            isListening && 'animate-pulse'
          )} />
          {isListening ? 'Stop Listening' : 'Talk to Acai'}
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          onClick={onEmergencyStop}
          className="h-14 px-6"
        >
          <Square className="w-5 h-5" />
        </Button>
      </div>

      {/* Quick Commands */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Quick Commands:</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            "Next step"
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            "Repeat that"
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            "Set timer"
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            "How long?"
          </Button>
        </div>
      </div>
    </Card>
  );
};
```

### Kitchen Utility Components

#### KitchenTimerPanel Component
```tsx
interface KitchenTimerPanelProps extends CookingComponentProps {
  timers: CookingTimer[];
  onAddTimer: (name: string, duration: number) => void;
  onRemoveTimer: (timerId: string) => void;
  onPauseTimer: (timerId: string) => void;
  onResumeTimer: (timerId: string) => void;
}

const KitchenTimerPanel: React.FC<KitchenTimerPanelProps> = ({
  timers,
  onAddTimer,
  onRemoveTimer,
  onPauseTimer,
  onResumeTimer,
  className,
  ...props
}) => {
  const [newTimerName, setNewTimerName] = useState('');
  const [newTimerDuration, setNewTimerDuration] = useState(5);

  const handleAddTimer = useCallback(() => {
    if (newTimerName.trim()) {
      onAddTimer(newTimerName.trim(), newTimerDuration);
      setNewTimerName('');
      setNewTimerDuration(5);
    }
  }, [newTimerName, newTimerDuration, onAddTimer]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={cn('kitchen-timer-panel p-4', className)} {...props}>
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Timer className="w-5 h-5" />
        Kitchen Timers
      </h3>

      {/* Active Timers */}
      <div className="space-y-3 mb-4">
        {timers.map((timer) => (
          <div
            key={timer.id}
            className={cn(
              'flex items-center justify-between p-3 rounded-lg border',
              timer.remaining <= 60 ? 'bg-red-50 border-red-200' : 'bg-gray-50'
            )}
          >
            <div>
              <div className="font-medium">{timer.name}</div>
              <div className={cn(
                'text-2xl font-mono',
                timer.remaining <= 60 ? 'text-red-600' : 'text-gray-900'
              )}>
                {formatTime(timer.remaining)}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => timer.isActive ? onPauseTimer(timer.id) : onResumeTimer(timer.id)}
              >
                {timer.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onRemoveTimer(timer.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Timer */}
      <div className="space-y-3 pt-3 border-t">
        <Input
          placeholder="Timer name (e.g., 'Pasta')"
          value={newTimerName}
          onChange={(e) => setNewTimerName(e.target.value)}
          className="h-12" // Large touch target
        />
        <div className="flex gap-2">
          <Input
            type="number"
            min="1"
            max="120"
            value={newTimerDuration}
            onChange={(e) => setNewTimerDuration(parseInt(e.target.value) || 5)}
            className="h-12 flex-1"
          />
          <Button
            onClick={handleAddTimer}
            disabled={!newTimerName.trim()}
            className="h-12 px-6"
          >
            Add Timer
          </Button>
        </div>
      </div>
    </Card>
  );
};
```

## Component Testing Patterns

### Test Structure for Cooking Components
```tsx
// RecipeCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { RecipeCard } from './RecipeCard';
import { createMockRecipe } from '../../test-utils/mock-factories';

describe('RecipeCard', () => {
  const mockRecipe = createMockRecipe({
    title: 'Chocolate Chip Cookies',
    difficulty: RecipeDifficulty.EASY,
    totalTime: 45
  });

  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('displays recipe information correctly', () => {
    render(<RecipeCard recipe={mockRecipe} onSelect={mockOnSelect} />);
    
    expect(screen.getByText('Chocolate Chip Cookies')).toBeInTheDocument();
    expect(screen.getByText('Easy')).toBeInTheDocument();
    expect(screen.getByText('45min')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    render(<RecipeCard recipe={mockRecipe} onSelect={mockOnSelect} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnSelect).toHaveBeenCalledWith(mockRecipe.id);
  });

  it('supports keyboard navigation', () => {
    render(<RecipeCard recipe={mockRecipe} onSelect={mockOnSelect} />);
    
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(mockOnSelect).toHaveBeenCalledWith(mockRecipe.id);
  });

  it('shows selected state correctly', () => {
    render(<RecipeCard recipe={mockRecipe} onSelect={mockOnSelect} isSelected />);
    
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-selected', 'true');
  });
});
```

## Accessibility Requirements

### Kitchen-Specific A11y Considerations
- **Screen Reader Support**: All cooking steps must be readable by screen readers
- **High Contrast**: Support high contrast mode for kitchen lighting
- **Large Text**: Support text scaling up to 200%
- **Voice Commands**: Full keyboard navigation alternative to voice commands
- **Emergency Stop**: Always accessible emergency stop functionality

### ARIA Labels for Cooking Components
```tsx
// Example ARIA implementation
const CookingStepGuide: React.FC<CookingStepGuideProps> = ({ ... }) => {
  return (
    <div
      role="main"
      aria-label={`Cooking step ${currentStep} of ${recipe.steps.length}`}
      aria-live="polite" // Announces step changes
    >
      <div
        role="region"
        aria-labelledby="current-step-heading"
        aria-describedby="step-instruction"
      >
        <h2 id="current-step-heading" className="sr-only">
          Current Cooking Step
        </h2>
        <p id="step-instruction" className="text-lg">
          {step.instruction}
        </p>
      </div>
      
      {step.warnings && (
        <div role="alert" aria-label="Safety warning">
          {step.warnings.map((warning, index) => (
            <p key={index}>{warning}</p>
          ))}
        </div>
      )}
    </div>
  );
};
```
