"use client";

import { useRecipe } from "@/hooks/use-recipe";
import { useConnection } from "@/hooks/use-connection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Users, ChefHat } from "lucide-react";

interface RecipeCompletionSummaryProps {
  onExit: () => void;
}

export function RecipeCompletionSummary({ onExit }: RecipeCompletionSummaryProps) {
  const { currentRecipe, cookingSession } = useRecipe();
  const { disconnect } = useConnection();

  const handleExit = async () => {
    try {
      // Disconnect from AI
      await disconnect();
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
    // Call the exit callback to return to home
    onExit();
  };

  if (!currentRecipe) {
    return null;
  }

  const completedSteps = cookingSession?.completedSteps.length || 0;
  // Simplified since we now have single instruction instead of multiple steps
  const totalSteps = 1;

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Recipe Complete! 🎉</h1>
        <p className="text-muted-foreground">
          Congratulations! You've successfully completed the recipe.
        </p>
      </div>

      {/* Recipe Summary Card */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        {/* Recipe Image */}
        {currentRecipe.imageUrl && (
          <div className="w-full h-32 rounded-lg overflow-hidden bg-muted">
            <img
              src={currentRecipe.imageUrl}
              alt={currentRecipe.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Recipe Info */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">{currentRecipe.title}</h2>
          <p className="text-sm text-muted-foreground">{currentRecipe.description}</p>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{currentRecipe.totalTime} min</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{currentRecipe.servings || 1} serving{(currentRecipe.servings || 1) > 1 ? 's' : ''}</span>
            </div>
            <Badge variant={
              currentRecipe.difficulty === 'Easy' ? 'default' :
              currentRecipe.difficulty === 'Medium' ? 'secondary' : 'destructive'
            }>
              {currentRecipe.difficulty}
            </Badge>
          </div>

          {/* Progress */}
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-green-800 dark:text-green-200">
                ✅ Steps Completed
              </span>
              <span className="text-green-700 dark:text-green-300">
                {completedSteps} / {totalSteps}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {currentRecipe.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Completion Message */}
      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ChefHat className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-orange-800 dark:text-orange-200 mb-1">
              Great job cooking with Acai! 👨‍🍳
            </h3>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              You've successfully prepared {currentRecipe.title}. We hope you enjoyed cooking together and that your meal turns out delicious!
            </p>
          </div>
        </div>
      </div>

      {/* Exit Button */}
      <Button 
        onClick={handleExit}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
        size="lg"
      >
        Back to Home
      </Button>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Thank you for cooking with All You Can Cook! 🍳
        </p>
      </div>
    </div>
  );
}
