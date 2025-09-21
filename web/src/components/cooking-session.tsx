"use client";

import { useRecipe } from "@/hooks/use-recipe";
import { useConnection } from "@/hooks/use-connection";

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
      <div className="text-center">
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
            {currentRecipe.instructions || 'No instructions available'}
          </p>
        </div>
      </div>

    </div>
  );
}
