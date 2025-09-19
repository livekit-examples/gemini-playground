"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { Recipe, CookingSession, CookingTimer, sampleRecipe } from "@/data/recipe-types";
import type { RecipeContext } from "@/data/recipe-types";

// Recipe management context and hooks
interface RecipeContextType {
  // Recipe data
  currentRecipe: Recipe | null;
  setCurrentRecipe: (recipe: Recipe | null) => void;
  
  // Cooking session
  cookingSession: CookingSession | null;
  startCookingSession: (recipe: Recipe) => void;
  pauseCookingSession: () => void;
  resumeCookingSession: () => void;
  endCookingSession: () => void;
  
  // Step navigation
  currentStep: number;
  goToStep: (stepNumber: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  markStepCompleted: (stepNumber: number) => void;
  
  // Timers
  activeTimers: CookingTimer[];
  createTimer: (name: string, duration: number, stepNumber?: number) => string;
  startTimer: (timerId: string) => void;
  pauseTimer: (timerId: string) => void;
  deleteTimer: (timerId: string) => void;
  
  // Recipe context for AI
  getRecipeContext: () => RecipeContext | null;
}

const RecipeManagementContext = createContext<RecipeContextType | undefined>(undefined);

interface RecipeProviderProps {
  children: ReactNode;
}

export function RecipeProvider({ children }: RecipeProviderProps) {
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [cookingSession, setCookingSession] = useState<CookingSession | null>(null);
  const [activeTimers, setActiveTimers] = useState<CookingTimer[]>([]);

  // Load saved session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('cooking-session');
    if (savedSession) {
      try {
        const session: CookingSession = JSON.parse(savedSession);
        setCookingSession(session);
        
        // Load the recipe for the session
        if (session.recipeId === sampleRecipe.id) {
          setCurrentRecipe(sampleRecipe);
        }
      } catch (error) {
        console.error('Failed to load cooking session:', error);
        localStorage.removeItem('cooking-session');
      }
    }
  }, []);

  // Save session to localStorage whenever it changes
  useEffect(() => {
    if (cookingSession) {
      localStorage.setItem('cooking-session', JSON.stringify(cookingSession));
    } else {
      localStorage.removeItem('cooking-session');
    }
  }, [cookingSession]);

  // Timer management
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTimers(timers => {
        // Check if any timers actually need updating
        const hasActiveTimers = timers.some(timer => timer.isActive && timer.remainingTime > 0);
        if (!hasActiveTimers) {
          return timers; // No change, prevent re-render
        }
        
        let hasChanges = false;
        const updatedTimers = timers.map(timer => {
          if (timer.isActive && timer.remainingTime > 0) {
            const newRemainingTime = timer.remainingTime - 1;
            hasChanges = true;
            
            // Timer finished
            if (newRemainingTime === 0) {
              // Show notification (browser API)
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(`Timer "${timer.name}" finished!`, {
                  icon: '/favicon.ico',
                  badge: '/favicon.ico'
                });
              }
              
              // Play sound or other alert here
              console.log(`Timer "${timer.name}" finished!`);
              
              return { ...timer, remainingTime: 0, isActive: false };
            }
            
            return { ...timer, remainingTime: newRemainingTime };
          }
          return timer;
        });
        
        // Only return new array if there were actual changes
        return hasChanges ? updatedTimers : timers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const startCookingSession = (recipe: Recipe) => {
    const newSession: CookingSession = {
      id: `session-${Date.now()}`,
      recipeId: recipe.id,
      currentStep: 1,
      startedAt: new Date(),
      completedSteps: [],
      activeTimers: [],
      notes: '',
      status: 'active'
    };
    
    setCurrentRecipe(recipe);
    setCookingSession(newSession);
    setActiveTimers([]);
  };

  const pauseCookingSession = () => {
    if (cookingSession) {
      setCookingSession({ ...cookingSession, status: 'paused' });
      // Pause all timers
      setActiveTimers(timers => 
        timers.map(timer => ({ ...timer, isActive: false }))
      );
    }
  };

  const resumeCookingSession = () => {
    if (cookingSession) {
      setCookingSession({ ...cookingSession, status: 'active' });
    }
  };

  const endCookingSession = () => {
    if (cookingSession) {
      if (cookingSession.status === 'completed') {
        // If already completed, clear everything (called from completion page)
        setCookingSession(null);
        setCurrentRecipe(null);
      } else {
        // Mark as completed to show completion page
        setCookingSession({ ...cookingSession, status: 'completed' });
        setActiveTimers([]);
      }
    }
  };

  // Step navigation simplified since we now have single instruction
  const goToStep = (stepNumber: number) => {
    // No longer needed with single instruction format
  };

  const nextStep = () => {
    // No longer needed with single instruction format
  };

  const previousStep = () => {
    if (cookingSession) {
      const prevStepNumber = Math.max(cookingSession.currentStep - 1, 1);
      goToStep(prevStepNumber);
    }
  };

  const markStepCompleted = (stepNumber: number) => {
    if (cookingSession) {
      const completedSteps = [...cookingSession.completedSteps];
      if (!completedSteps.includes(stepNumber)) {
        completedSteps.push(stepNumber);
        setCookingSession({ ...cookingSession, completedSteps });
      }
    }
  };

  const createTimer = (name: string, duration: number, stepNumber?: number): string => {
    const timer: CookingTimer = {
      id: `timer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      duration,
      remainingTime: duration,
      isActive: false,
      stepNumber,
      createdAt: new Date()
    };
    
    setActiveTimers(timers => [...timers, timer]);
    return timer.id;
  };

  const startTimer = (timerId: string) => {
    setActiveTimers(timers =>
      timers.map(timer =>
        timer.id === timerId ? { ...timer, isActive: true } : timer
      )
    );
  };

  const pauseTimer = (timerId: string) => {
    setActiveTimers(timers =>
      timers.map(timer =>
        timer.id === timerId ? { ...timer, isActive: false } : timer
      )
    );
  };

  const deleteTimer = (timerId: string) => {
    setActiveTimers(timers => timers.filter(timer => timer.id !== timerId));
  };

  const getRecipeContext = (): RecipeContext | null => {
    if (!currentRecipe || !cookingSession) return null;
    
    return {
      recipe: currentRecipe,
      currentStep: cookingSession.currentStep,
      completedSteps: cookingSession.completedSteps,
      activeTimers,
      sessionNotes: cookingSession.notes
    };
  };

  const value: RecipeContextType = {
    currentRecipe,
    setCurrentRecipe,
    cookingSession,
    startCookingSession,
    pauseCookingSession,
    resumeCookingSession,
    endCookingSession,
    currentStep: cookingSession?.currentStep || 1,
    goToStep,
    nextStep,
    previousStep,
    markStepCompleted,
    activeTimers,
    createTimer,
    startTimer,
    pauseTimer,
    deleteTimer,
    getRecipeContext
  };

  return (
    <RecipeManagementContext.Provider value={value}>
      {children}
    </RecipeManagementContext.Provider>
  );
}

export function useRecipe() {
  const context = useContext(RecipeManagementContext);
  if (context === undefined) {
    throw new Error('useRecipe must be used within a RecipeProvider');
  }
  return context;
}

// Hook to request notification permissions
export function useNotificationPermission() {
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);
}
