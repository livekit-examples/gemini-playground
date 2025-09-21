"use client";

import { useState } from "react";
import { Recipe, RecipeContext } from "@/data/recipe-types";
import { useRecipe } from "@/hooks/use-recipe";
import { useConnection } from "@/hooks/use-connection";
import { usePlaygroundState } from "@/hooks/use-playground-state";
import { useAuth } from "@/contexts/auth-context";
import { generateRecipeAwareInstructions } from "@/lib/recipe-context-generator";
import { useRecipeCache } from "@/services/recipe-cache";
import { mealDBApi } from "@/services/mealdb-api";
import { transformMealDBToRecipe } from "@/utils/mealdb-transformer";
import { RecipeBrowser } from "@/components/recipe-browser";
import { VoiceSelection } from "@/components/voice-selection";
import { LoginPage } from "@/components/login-page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChefHat, ArrowLeft } from "lucide-react";

interface RecipeSelectorProps {
  onRecipeSelected?: (recipe: Recipe) => void;
}

export function RecipeSelector({ onRecipeSelected }: RecipeSelectorProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { startCookingSession, getRecipeContext } = useRecipe();
  const { connect } = useConnection();
  const { pgState, dispatch } = usePlaygroundState();
  const { cacheRecipe } = useRecipeCache();
  const { user } = useAuth();

  const handleRecipeClick = async (recipe: Recipe) => {
    // If it's a preview recipe, load the full details
    if (recipe.isPreview) {
      try {
        const fullMeal = await mealDBApi.getMealById(recipe.id);
        if (fullMeal) {
          const fullRecipe = transformMealDBToRecipe(fullMeal);
          // Cache the full recipe for offline access (only on client side)
          cacheRecipe(fullRecipe);
          setSelectedRecipe(fullRecipe);
        } else {
          // Fallback to preview if full details fail to load
          cacheRecipe(recipe);
          setSelectedRecipe(recipe);
        }
      } catch (error) {
        console.warn('Failed to load full recipe details, using preview:', error);
        // Fallback to preview if full details fail to load
        cacheRecipe(recipe);
        setSelectedRecipe(recipe);
      }
    } else {
      // Full recipe already, just use it
      cacheRecipe(recipe);
      setSelectedRecipe(recipe);
    }
  };

  const handleStartCooking = async () => {
    if (selectedRecipe) {
      // Check if user is authenticated before starting cooking session
      if (!user) {
        setShowLoginDialog(true);
        return;
      }

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
      <>
        <div className="w-full max-w-md mx-auto h-full flex flex-col">
          {/* Fixed Header with back button */}
          <div className="flex items-center gap-3 p-4 pb-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToList}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold text-foreground">{selectedRecipe.title}</h2>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="space-y-4">

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
          <p className="text-sm text-muted-foreground">{selectedRecipe.description}</p>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4 text-sm">
            {selectedRecipe.totalTime && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{selectedRecipe.totalTime} min</span>
              </div>
            )}
            {selectedRecipe.servings && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{selectedRecipe.servings} serving{selectedRecipe.servings > 1 ? 's' : ''}</span>
              </div>
            )}
            {selectedRecipe.difficulty && (
              <Badge variant={
                selectedRecipe.difficulty === 'Easy' ? 'default' :
                selectedRecipe.difficulty === 'Medium' ? 'secondary' : 'destructive'
              }>
                {selectedRecipe.difficulty}
              </Badge>
            )}
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

        {/* Instructions */}
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">Instructions</h4>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-foreground text-sm leading-relaxed whitespace-pre-line">
              {selectedRecipe.instructions || 'No instructions available'}
            </p>
          </div>
        </div>

        {/* Voice Selection - Choose Acai's voice */}
        <div className="mt-6 mb-4">
          <div className="text-sm font-medium text-foreground mb-3 text-center">
            Choose Acai&apos;s Voice
          </div>
          <VoiceSelection />
        </div>

        {/* Start Cooking Button */}
        <Button 
          onClick={handleStartCooking}
          disabled={isConnecting}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3"
          size="lg"
        >
          <ChefHat className="mr-2 h-5 w-5" />
          {isConnecting ? "Connecting to Acai..." : user ? "Start Cooking with Acai" : "Sign In to Start Cooking Session"}
            </Button>
            </div>
          </div>
        </div>
        
        <LoginPage
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        onLoginSuccess={() => {
          // After successful login, automatically start cooking if recipe was selected
          if (selectedRecipe && !isConnecting) {
            handleStartCooking();
          }
        }}
      />
    </>);
  }

  // Recipe List View - Use the new RecipeBrowser component
  return (
    <>
      <RecipeBrowser onRecipeSelected={handleRecipeClick} />
      <LoginPage
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        onLoginSuccess={() => {
          // After successful login, automatically start cooking if recipe was selected
          if (selectedRecipe && !isConnecting) {
            handleStartCooking();
          }
        }}
      />
    </>
  );
}
