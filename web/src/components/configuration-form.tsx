"use client";

import { useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { VoiceId } from "@/data/voices";
import { ModelId } from "@/data/models";
import { UseFormReturn } from "react-hook-form";
import { usePlaygroundState } from "@/hooks/use-playground-state";
import {
  useConnectionState,
  useLocalParticipant,
  useVoiceAssistant,
} from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
import { Button } from "@/components/ui/button";
import { defaultSessionConfig } from "@/data/playground-state";
import { useConnection } from "@/hooks/use-connection";
import { RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ModalitiesId } from "@/data/modalities";
import { useRecipe } from "@/hooks/use-recipe";
import { generateRecipeAwareInstructions } from "@/lib/recipe-context-generator";
export const ConfigurationFormSchema = z.object({
  model: z.nativeEnum(ModelId),
  modalities: z.nativeEnum(ModalitiesId),
  voice: z.nativeEnum(VoiceId),
  temperature: z.number().min(0.6).max(1.2),
  maxOutputTokens: z.number().nullable(),
});

export interface ConfigurationFormFieldProps {
  form: UseFormReturn<z.infer<typeof ConfigurationFormSchema>>;
  schema?: typeof ConfigurationFormSchema;
}

export function ConfigurationForm() {
  const { pgState, dispatch } = usePlaygroundState();
  const connectionState = useConnectionState();
  const { voice, disconnect, connect } = useConnection();
  const { localParticipant } = useLocalParticipant();
  const { getRecipeContext, cookingSession } = useRecipe();
  const form = useForm<z.infer<typeof ConfigurationFormSchema>>({
    resolver: zodResolver(ConfigurationFormSchema),
    defaultValues: { ...defaultSessionConfig },
    mode: "onChange",
  });
  const formValues = form.watch();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref to track timeout
  const { toast } = useToast();
  const { agent } = useVoiceAssistant();

  const updateConfig = useCallback(async () => {
    // Skip all config updates during active cooking sessions
    if (cookingSession && cookingSession.status === 'active') {
      console.log('🍳 Skipping config update - cooking session is active');
      return;
    }

    // Check if we're connected and have necessary components
    if (connectionState !== ConnectionState.Connected) {
      console.log('⏸️ Skipping config update - not connected');
      return;
    }

    if (!agent?.identity) {
      console.log('⏸️ Skipping config update - no agent identity');
      return;
    }

    if (!localParticipant) {
      console.log('⏸️ Skipping config update - no local participant');
      return;
    }

    const values = pgState.sessionConfig;
    
    // Get recipe context and generate recipe-aware instructions
    const recipeContext = getRecipeContext();
    console.log('🔄 ConfigurationForm: Recipe context update triggered:', {
      hasRecipeContext: !!recipeContext,
      recipeName: recipeContext?.recipe?.title,
      currentStep: recipeContext?.currentStep,
      connectionState,
      agentIdentity: agent.identity
    });
    
    const contextualInstructions = generateRecipeAwareInstructions(
      pgState.instructions,
      recipeContext
    );
    
    const attributes: { [key: string]: string } = {
      instructions: contextualInstructions,
      voice: values.voice,
      modalities: values.modalities,
      temperature: values.temperature.toString(),
      max_output_tokens: values.maxOutputTokens
        ? values.maxOutputTokens.toString()
        : "",
    };

    // Check if the local participant already has attributes set
    const hadExistingAttributes =
      Object.keys(localParticipant.attributes).length > 0;

    // Check if only the voice attribute has changed
    const onlyVoiceChanged = Object.keys(attributes).every(
      (key) =>
        key === "voice" ||
        attributes[key] === (localParticipant.attributes[key] as string)
    );

    // If only voice changed, or if there were no existing attributes, don't update or show toast
    if (onlyVoiceChanged) {
      console.log('⏸️ Skipping config update - only voice changed or no existing attributes');
      return;
    }

    try {
      console.log('📡 Sending config update to agent...');
      let response = await localParticipant.performRpc({
        destinationIdentity: agent.identity,
        method: "pg.updateConfig",
        payload: JSON.stringify(attributes),
      });
      console.log("✅ pg.updateConfig response:", response);
      let responseObj = JSON.parse(response);
      if (responseObj.changed) {
        console.log('🔄 Configuration updated successfully');
        toast({
          title: "Configuration Updated",
          description: "Your changes have been applied successfully.",
          variant: "success",
        });
      }
    } catch (e) {
      console.error('❌ Error updating configuration:', e);
      toast({
        title: "Error Updating Configuration",
        description:
          "There was an error updating your configuration. Please try again.",
        variant: "destructive",
      });
    }
  }, [
    cookingSession,
    connectionState,
    pgState.sessionConfig,
    pgState.instructions,
    localParticipant,
    toast,
    agent,
    getRecipeContext,
  ]);

  // Function to debounce updates when user stops interacting
  const handleDebouncedUpdate = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current); // Clear existing timeout
    }

    // Set a new timeout to perform the update after 500ms of inactivity
    debounceTimeoutRef.current = setTimeout(() => {
      updateConfig();
    }, 500); // Adjust delay as needed
  }, [updateConfig]);

  // Propagate form upates from the user
  useEffect(() => {
    if (form.formState.isValid && form.formState.isDirty) {
      dispatch({
        type: "SET_SESSION_CONFIG",
        payload: formValues,
      });
    }
  }, [formValues, dispatch, form]);

  useEffect(() => {
    if (ConnectionState.Connected === connectionState) {
      // Skip all updates during active cooking sessions
      if (cookingSession && cookingSession.status === 'active') {
        console.log('🍳 Skipping connection config update - cooking session is active');
        return;
      }
      
      // For non-cooking connections, still allow config updates
      console.log('🔄 Non-cooking connection detected, updating config...');
      setTimeout(() => {
        handleDebouncedUpdate(); // Call debounced update when form changes
      }, 1000);
    }

    form.reset(pgState.sessionConfig);
  }, [pgState.sessionConfig, connectionState, handleDebouncedUpdate, form, cookingSession]);

  return (
    <Form {...form}>
      <form className="h-full">
        <div className="flex flex-col h-full">
          <div className="flex-shrink-0 py-4 px-1">
            <div className="text-xs font-semibold uppercase tracking-widest">
              Configuration
            </div>
          </div>
          <div className="flex-grow overflow-y-auto py-4 pt-0">
            <div className="space-y-4">
              {/* SessionConfig component removed - settings are now hardcoded */}

              {pgState.sessionConfig.voice !== voice &&
                ConnectionState.Connected === connectionState && (
                  <div className="flex flex-col">
                    <div className="text-xs my-2">
                      Your change to the voice parameter requires a reconnect.
                    </div>
                    <div className="flex w-full">
                      <Button
                        className="flex-1"
                        type="button"
                        variant="primary"
                        onClick={() => {
                          disconnect().then(() => {
                            connect();
                          });
                        }}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" /> Reconnect Now
                      </Button>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
