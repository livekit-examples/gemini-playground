"use client";

import { useRecipe } from "@/hooks/use-recipe";
import { useConnection } from "@/hooks/use-connection";
import { Button } from "@/components/ui/button";
import { 
  StopCircle,
  PlayCircle,
  PauseCircle,
  ChefHat
} from "lucide-react";

export function CookingSession() {
  const {
    currentRecipe,
    cookingSession,
    pauseCookingSession,
    resumeCookingSession,
    endCookingSession,
    activeTimers,
  } = useRecipe();
  const { disconnect } = useConnection();

  if (!currentRecipe || !cookingSession) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <ChefHat className="h-6 w-6 text-orange-500" />
          <h2 className="text-xl font-bold text-foreground">Cooking with Acai</h2>
        </div>
        <h3 className="text-lg font-semibold text-foreground">{currentRecipe.title}</h3>
      </div>

      {/* Active Timers */}
      {activeTimers.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 space-y-2">
          <h4 className="font-semibold text-orange-800 dark:text-orange-200 text-sm">Active Timers</h4>
          {activeTimers.map((timer) => (
            <div key={timer.id} className="flex justify-between items-center">
              <span className="text-sm text-orange-700 dark:text-orange-300">{timer.name}</span>
              <span className="font-mono text-sm text-orange-800 dark:text-orange-200">
                {formatTime(timer.remainingTime)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Full Instructions */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h4 className="font-semibold text-foreground mb-3">Instructions</h4>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-foreground leading-relaxed whitespace-pre-line">
            {currentRecipe.steps[0]?.instruction || 'No instructions available'}
          </p>
        </div>
      </div>

      {/* Session Controls */}
      <div className="flex gap-3">
        {cookingSession.status === 'active' ? (
          <Button
            onClick={pauseCookingSession}
            variant="outline"
            size="lg"
            className="flex-1 h-12"
          >
            <PauseCircle className="mr-2 h-5 w-5" />
            Pause Session
          </Button>
        ) : (
          <Button
            onClick={resumeCookingSession}
            variant="outline"
            size="lg"
            className="flex-1 h-12"
          >
            <PlayCircle className="mr-2 h-5 w-5" />
            Resume Session
          </Button>
        )}
        
        <Button
          onClick={async () => {
            try {
              await disconnect();
            } catch (error) {
              console.error('Error disconnecting:', error);
            }
            endCookingSession();
          }}
          variant="destructive"
          size="lg"
          className="flex-1 h-12"
        >
          <StopCircle className="mr-2 h-5 w-5" />
          End Session
        </Button>
      </div>

      {/* Cooking Tips */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 dark:text-blue-200 text-sm mb-2">💡 Cooking with Acai</h4>
        <p className="text-blue-700 dark:text-blue-300 text-sm">
          Ask me questions about the recipe, cooking techniques, or ingredient substitutions. 
          I'm here to help guide you through the cooking process step by step!
        </p>
      </div>
    </div>
  );
}
