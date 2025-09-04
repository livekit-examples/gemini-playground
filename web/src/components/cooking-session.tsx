"use client";

import { useRecipe } from "@/hooks/use-recipe";
import { useConnection } from "@/hooks/use-connection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  Circle,
  StopCircle,
  PlayCircle,
  PauseCircle
} from "lucide-react";

export function CookingSession() {
  const {
    currentRecipe,
    cookingSession,
    currentStep,
    goToStep,
    nextStep,
    previousStep,
    markStepCompleted,
    pauseCookingSession,
    resumeCookingSession,
    endCookingSession,
    activeTimers,
    createTimer,
    startTimer
  } = useRecipe();
  const { disconnect } = useConnection();

  if (!currentRecipe || !cookingSession) {
    return null;
  }

  const currentStepData = currentRecipe.steps.find(step => step.stepNumber === currentStep);
  const progress = (currentStep / currentRecipe.steps.length) * 100;
  const isLastStep = currentStep === currentRecipe.steps.length;
  const isFirstStep = currentStep === 1;
  const isStepCompleted = cookingSession.completedSteps.includes(currentStep);

  const handleCompleteStep = () => {
    markStepCompleted(currentStep);
    if (isLastStep) {
      // Complete the recipe and end the session
      endCookingSession();
    } else {
      nextStep();
    }
  };

  const handleCreateTimer = () => {
    if (currentStepData?.duration) {
      const timerId = createTimer(
        `Step ${currentStep} Timer`,
        currentStepData.duration * 60, // Convert minutes to seconds
        currentStep
      );
      startTimer(timerId);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-md mx-auto p-2 space-y-3">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-foreground">{currentRecipe.title}</h2>
        <div className="space-y-1">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Step {currentStep} of {currentRecipe.steps.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Active Timers */}
      {activeTimers.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 space-y-2">
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

      {/* Current Step */}
      {currentStepData && (
        <div className="bg-card border border-border rounded-lg p-3 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
                {currentStep}
              </div>
              <div className="text-sm">
                {currentStepData.duration && (
                  <div className="flex items-center gap-1 text-muted-foreground mb-1">
                    <Clock className="h-3 w-3" />
                    <span>{currentStepData.duration} min</span>
                  </div>
                )}
              </div>
            </div>
            
            {isStepCompleted ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          <div className="space-y-3">
            <p className="text-foreground leading-relaxed">{currentStepData.instruction}</p>
            

          </div>

          {/* Timer Button */}
          {currentStepData.duration && (
            <Button
              onClick={handleCreateTimer}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Clock className="mr-2 h-4 w-4" />
              Start {currentStepData.duration} min timer
            </Button>
          )}
        </div>
      )}

      {/* Navigation Controls */}
      <div className="space-y-3">
        {/* Step Navigation */}
        <div className="flex gap-2">
          <Button
            onClick={previousStep}
            disabled={isFirstStep}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          
          {isLastStep ? (
            <Button
              onClick={handleCompleteStep}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <CheckCircle className="mr-1 h-4 w-4" />
              Complete Recipe
            </Button>
          ) : (
            <Button
              onClick={handleCompleteStep}
              variant="default"
              size="sm"
              className="flex-1"
            >
              {isStepCompleted ? 'Next' : 'Mark Done & Next'}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Session Controls */}
        <div className="flex gap-2">
          {cookingSession.status === 'active' ? (
            <Button
              onClick={pauseCookingSession}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <PauseCircle className="mr-2 h-4 w-4" />
              Pause Session
            </Button>
          ) : (
            <Button
              onClick={resumeCookingSession}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <PlayCircle className="mr-2 h-4 w-4" />
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
            size="sm"
            className="flex-1"
          >
            <StopCircle className="mr-2 h-4 w-4" />
            End Session
          </Button>
        </div>
      </div>

      {/* Quick Step Jump */}
      <div className="bg-muted rounded-lg p-2">
        <h4 className="font-medium text-foreground text-xs mb-2">Jump to Step:</h4>
        <div className="flex flex-wrap gap-1">
          {currentRecipe.steps.map((step) => (
            <Button
              key={step.stepNumber}
              onClick={() => goToStep(step.stepNumber)}
              variant={step.stepNumber === currentStep ? "default" : "outline"}
              size="sm"
              className="w-7 h-7 p-0 text-xs"
            >
              {step.stepNumber}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
