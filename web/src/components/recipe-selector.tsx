"use client";

import { useState } from "react";
import { Recipe, RecipeContext } from "@/data/recipe-types";
import { hardcodedRecipes } from "@/data/hardcoded-recipes";
import { useRecipe } from "@/hooks/use-recipe";
import { useConnection } from "@/hooks/use-connection";
import { usePlaygroundState } from "@/hooks/use-playground-state";
import { generateRecipeAwareInstructions } from "@/lib/recipe-context-generator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChefHat, ArrowLeft } from "lucide-react";

interface RecipeSelectorProps {
  onRecipeSelected?: (recipe: Recipe) => void;
}

export function RecipeSelector({ onRecipeSelected }: RecipeSelectorProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { startCookingSession, getRecipeContext } = useRecipe();
  const { connect } = useConnection();
  const { pgState, dispatch } = usePlaygroundState();

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleStartCooking = async () => {
    if (selectedRecipe) {
      setIsConnecting(true);
      try {
        console.log('🍳 Starting cooking session with recipe:', selectedRecipe.title);
        
        // 1. Start the cooking session first (this will set the recipe context)
        startCookingSession(selectedRecipe);
        
        // 2. Create recipe context directly from selected recipe (don't rely on async state)
        const recipeContext: RecipeContext = {
          recipe: selectedRecipe,
          currentStep: 1,
          completedSteps: [],
          activeTimers: [],
          sessionNotes: ''
        };
        
        console.log('🔍 Using selected recipe for context:', {
          hasContext: !!recipeContext,
          recipeName: recipeContext.recipe.title,
          currentStep: recipeContext.currentStep
        });
        
        if (recipeContext) {
          const contextualInstructions = generateRecipeAwareInstructions(
            pgState.instructions,
            recipeContext
          );
          
          console.log('📝 Generated recipe-aware instructions');
          console.log('🔍 Instructions preview:', contextualInstructions.substring(0, 200) + '...');
          
          // Update playground state for UI consistency (but don't wait for it)
          dispatch({
            type: "SET_INSTRUCTIONS",
            payload: contextualInstructions,
          });
          
          // 4. Connect to AI with the generated instructions directly
          console.log('🔗 Connecting to AI with recipe context...');
          await connect(contextualInstructions);
        } else {
          console.warn('❌ No recipe context available, connecting with default instructions');
          // 5. Connect to AI with default instructions
          console.log('🔗 Connecting to AI with default instructions...');
          await connect();
        }
        
        onRecipeSelected?.(selectedRecipe);
      } catch (error) {
        console.error('Failed to connect to AI:', error);
        // Still proceed with the cooking session even if AI connection fails
        onRecipeSelected?.(selectedRecipe);
      } finally {
        setIsConnecting(false);
      }
    }
  };

  const handleBackToList = () => {
    setSelectedRecipe(null);
  };

  if (selectedRecipe) {
    return (
      <div className="w-full max-w-md mx-auto p-4 space-y-4">
        {/* Header with back button */}
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToList}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold text-foreground">Recipe Details</h2>
        </div>

        {/* Recipe Image */}
        {selectedRecipe.imageUrl && (
          <div className="w-full h-48 rounded-lg overflow-hidden bg-muted">
            <img
              src={selectedRecipe.imageUrl}
              alt={selectedRecipe.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Recipe Info */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-foreground">{selectedRecipe.title}</h3>
          <p className="text-sm text-muted-foreground">{selectedRecipe.description}</p>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{selectedRecipe.totalTime} min</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{selectedRecipe.servings} serving{selectedRecipe.servings > 1 ? 's' : ''}</span>
            </div>
            <Badge variant={
              selectedRecipe.difficulty === 'Easy' ? 'default' :
              selectedRecipe.difficulty === 'Medium' ? 'secondary' : 'destructive'
            }>
              {selectedRecipe.difficulty}
            </Badge>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {selectedRecipe.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Ingredients */}
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">Ingredients ({selectedRecipe.ingredients.length})</h4>
          <div className="space-y-1">
            {selectedRecipe.ingredients.map((ingredient) => (
              <div key={ingredient.id} className="flex justify-between items-center text-sm py-1">
                <span className="text-foreground">
                  {ingredient.name}
                  {ingredient.optional && <span className="text-muted-foreground"> (optional)</span>}
                </span>
                <span className="text-muted-foreground">
                  {ingredient.amount} {ingredient.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Steps Preview */}
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">Steps ({selectedRecipe.steps.length})</h4>
          <div className="space-y-3">
            {selectedRecipe.steps.map((step) => (
              <div key={step.stepNumber} className="flex gap-3 text-sm">
                <div className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                  {step.stepNumber}
                </div>
                <div className="flex-1">
                  <p className="text-foreground text-sm leading-relaxed">
                    {step.instruction}
                  </p>
                  {step.duration && (
                    <p className="text-muted-foreground text-xs mt-1">
                      ⏱️ {step.duration} minutes
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Start Cooking Button */}
        <Button 
          onClick={handleStartCooking}
          disabled={isConnecting}
          className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3"
          size="lg"
        >
          <ChefHat className="mr-2 h-5 w-5" />
          {isConnecting ? "Connecting to Acai..." : "Start Cooking with Acai"}
        </Button>
      </div>
    );
  }

  // Recipe List View
  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-foreground mb-2">Choose Your Recipe</h2>
        <p className="text-sm text-muted-foreground">Select a recipe to start cooking with Acai</p>
      </div>

      <div className="space-y-4">
        {hardcodedRecipes.map((recipe) => (
          <div
            key={recipe.id}
            onClick={() => handleRecipeClick(recipe)}
            className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors"
          >
            <div className="flex gap-3">
              {/* Recipe Image */}
              <div className="flex-shrink-0 w-16 h-16 bg-muted rounded-lg overflow-hidden">
                {recipe.imageUrl ? (
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ChefHat className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Recipe Info */}
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-foreground text-sm">{recipe.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{recipe.description}</p>
                
                {/* Quick Stats */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{recipe.totalTime}m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{recipe.servings}</span>
                  </div>
                  <Badge variant="outline" className="text-xs py-0 px-2 h-5">
                    {recipe.difficulty}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-4">
        <p className="text-xs text-muted-foreground">
          More recipes coming soon! 🍳
        </p>
      </div>
    </div>
  );
}
