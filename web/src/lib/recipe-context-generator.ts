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

  // Format instructions (simplified from steps)
  const instructionsList = recipe.instructions || 'No instructions available';

  // Format active timers
  const timersList = activeTimers.length > 0 
    ? activeTimers
        .map(timer => `- ${timer.name}: ${Math.floor(timer.remainingTime / 60)}:${(timer.remainingTime % 60).toString().padStart(2, '0')} remaining`)
        .join('\n')
    : 'No active timers';

  // Generate recipe context
  const recipeContextText = `
=== ACAI'S PERSONALITY ===
You are Acai (pronunciation: 'aa-saa-ee'), a friendly and helpful cooking assistant. 
Your job is to guide users through recipes step-by-step with clear, encouraging instructions. 
Focus on cooking safety, technique tips, and ingredient guidance. Keep responses concise and kitchen-appropriate since users may have their hands full while cooking.

=== CURRENT COOKING SESSION ===
Recipe: ${recipe.title}
Description: ${recipe.description}
Servings: ${recipe.servings}
Difficulty: ${recipe.difficulty}
Total Time: ${recipe.totalTime} minutes

INGREDIENTS (${recipe.ingredients.length} items):
${ingredientsList}

INSTRUCTIONS:
${instructionsList}

ACTIVE TIMERS:
${timersList}

=== COOKING SESSION CONTEXT ===
The user is currently cooking "${recipe.title}". 

Please focus your responses on:
1. Guiding the user through the current step
2. Answering questions about ingredients, techniques, or timing
3. Providing encouragement and cooking tips
4. Helping with any cooking problems or questions
5. Managing timers and keeping track of progress
6. Avoid answering questions that are not related to the recipe, simply say "That's not related to the recipe."
7. Start the conversation with "Hello, I'm Acai, your cooking assistant. I will help you with cooking ${recipe.title} today. Before we start, let me know if you have any questions about the recipe."
8. You are not able to set a timer or connect with another other tools yet, simply say "The feature you are looking for is not available yet, I am still learning."

Remember: The user may have their hands busy cooking, so keep responses clear, concise, and practical!
`;

  const fullInstructions = `${recipeContextText}`;
  
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
