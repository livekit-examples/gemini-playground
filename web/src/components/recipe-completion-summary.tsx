"use client";

import { useRecipe } from "@/hooks/use-recipe";
import { useConnection } from "@/hooks/use-connection";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Users } from "lucide-react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface RecipeCompletionSummaryProps {
  onExit: () => void;
}

export function RecipeCompletionSummary({ onExit }: RecipeCompletionSummaryProps) {
  const { currentRecipe, cookingSession } = useRecipe();
  const { disconnect } = useConnection();
  const { user } = useAuth();

  const handleExit = async () => {
    try {
      // Save recipe completion to Firestore
      if (user && currentRecipe) {
        console.log('Saving recipe completion to Firestore...', {
          userId: user.uid,
          recipeId: currentRecipe.id,
          recipeTitle: currentRecipe.title,
          userEmail: user.email
        });
        
        // Ensure user is authenticated before writing to Firestore
        if (!user.uid) {
          throw new Error('User not properly authenticated');
        }

        // Verify current authentication state
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('No authenticated user found');
        }

        // Get fresh authentication token to ensure we have valid credentials
        const idToken = await currentUser.getIdToken(true);
        console.log('🔑 Got fresh authentication token');

        const docRef = await addDoc(collection(db, 'recipe_completions'), {
          userId: user.uid,
          recipeId: currentRecipe.id,
          recipeTitle: currentRecipe.title,
          completedAt: serverTimestamp(),
          sessionId: cookingSession?.id || null,
          userEmail: user.email, // Add user email for easier debugging
        });
        
        console.log('✅ Recipe completion saved to history with ID:', docRef.id);
      } else {
        console.warn('Cannot save recipe history: user or currentRecipe is null', {
          hasUser: !!user,
          hasRecipe: !!currentRecipe
        });
      }

      // Disconnect from AI
      await disconnect();
    } catch (error) {
      console.error('❌ Error saving recipe history or disconnecting:', error);
      
      // Still proceed with exit even if saving fails
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
      }
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
        <h1 className="text-2xl font-bold text-foreground">Congratulations! 🎉</h1>
        <p className="text-muted-foreground text-lg">
          You&apos;ve completed <span className="font-semibold text-foreground">{currentRecipe.title}</span>!
        </p>
        <p className="text-sm text-muted-foreground">
          Great job! We hope your meal turns out delicious!
        </p>
      </div>

      {/* Recipe Summary Card */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        {/* Recipe Image */}
        {currentRecipe.imageUrl && (
          <div className="w-full h-48 rounded-lg overflow-hidden bg-muted">
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
          Thank you for cooking with All You Can Cook!
        </p>
      </div>
    </div>
  );
}
