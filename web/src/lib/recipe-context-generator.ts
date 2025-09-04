import { RecipeContext } from "@/data/recipe-types";

/**
 * Generates AI instructions that include recipe context for cooking sessions
 */
export function generateRecipeAwareInstructions(
  baseInstructions: string,
  recipeContext?: RecipeContext | null
): string {
  console.log('🍳 generateRecipeAwareInstructions called:', {
    hasRecipeContext: !!recipeContext,
    recipeName: recipeContext?.recipe?.title,
    currentStep: recipeContext?.currentStep
  });
  
  if (!recipeContext) {
    console.log('❌ No recipe context available, using base instructions');
    return baseInstructions;
  }

  const { recipe, currentStep, completedSteps, activeTimers } = recipeContext;
  
  // Format ingredients list
  const ingredientsList = recipe.ingredients
    .map(ing => `- ${ing.amount} ${ing.unit} ${ing.name}${ing.notes ? ` (${ing.notes})` : ''}${ing.optional ? ' [OPTIONAL]' : ''}`)
    .join('\n');

  // Format steps list
  const stepsList = recipe.steps
    .map(step => {
      const isCompleted = completedSteps.includes(step.stepNumber);
      const isCurrent = step.stepNumber === currentStep;
      const status = isCompleted ? '[COMPLETED]' : isCurrent ? '[CURRENT STEP]' : '[UPCOMING]';
      
      let stepText = `${step.stepNumber}. ${status} ${step.instruction}`;
      
      if (step.duration) {
        stepText += ` (${step.duration} minutes)`;
      }
      
      if (step.tips && step.tips.length > 0) {
        stepText += `\n   Tips: ${step.tips.join('; ')}`;
      }
      
      return stepText;
    })
    .join('\n');

  // Format active timers
  const timersList = activeTimers.length > 0 
    ? activeTimers
        .map(timer => `- ${timer.name}: ${Math.floor(timer.remainingTime / 60)}:${(timer.remainingTime % 60).toString().padStart(2, '0')} remaining`)
        .join('\n')
    : 'No active timers';

  // Generate recipe context
  const recipeContextText = `
=== CURRENT COOKING SESSION ===
Recipe: ${recipe.title}
Description: ${recipe.description}
Servings: ${recipe.servings}
Difficulty: ${recipe.difficulty}
Total Time: ${recipe.totalTime} minutes

INGREDIENTS (${recipe.ingredients.length} items):
${ingredientsList}

COOKING STEPS (Step ${currentStep} of ${recipe.steps.length}):
${stepsList}

ACTIVE TIMERS:
${timersList}

PROGRESS: ${completedSteps.length} of ${recipe.steps.length} steps completed

=== COOKING SESSION CONTEXT ===
The user is currently cooking "${recipe.title}" and is on step ${currentStep} of ${recipe.steps.length}. 

${currentStep <= recipe.steps.length ? `
CURRENT STEP DETAILS:
${recipe.steps.find(s => s.stepNumber === currentStep)?.instruction}

` : ''}

Please focus your responses on:
1. Guiding the user through the current step
2. Answering questions about ingredients, techniques, or timing
3. Providing encouragement and cooking tips
4. Helping with any cooking problems or questions
5. Managing timers and keeping track of progress

Remember: The user may have their hands busy cooking, so keep responses clear, concise, and practical!
`;

  const fullInstructions = `${baseInstructions}\n\n${recipeContextText}`;
  
  console.log('✅ Generated recipe-aware instructions:', {
    instructionsLength: fullInstructions.length,
    recipeName: recipe.title,
    currentStepNumber: currentStep,
    preview: fullInstructions.substring(0, 200) + '...'
  });

  return fullInstructions;
}

/**
 * Helper function to check if recipe context has changed significantly
 */
export function hasRecipeContextChanged(
  oldContext: RecipeContext | null,
  newContext: RecipeContext | null
): boolean {
  if (!oldContext && !newContext) return false;
  if (!oldContext || !newContext) return true;
  
  return (
    oldContext.recipe.id !== newContext.recipe.id ||
    oldContext.currentStep !== newContext.currentStep ||
    oldContext.completedSteps.length !== newContext.completedSteps.length ||
    oldContext.activeTimers.length !== newContext.activeTimers.length
  );
}
