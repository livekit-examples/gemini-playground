"use client";

import { useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { SessionConfig } from "@/components/session-config";
import { VoiceId } from "@/data/voices";
import { ModelId } from "@/data/models";
import { UseFormReturn } from "react-hook-form";
import { usePlaygroundState } from "@/hooks/use-playground-state";
import { useConnection } from "@/hooks/use-connection";
import { playgroundStateHelpers } from "@/lib/playground-state-helpers";
import {
  useConnectionState,
  useLocalParticipant,
  useVoiceAssistant,
} from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
import { defaultSessionConfig } from "@/data/playground-state";
import { useToast } from "@/hooks/use-toast";
import { ModalitiesId } from "@/data/modalities";

// Configuration changes that require full reconnection instead of hot-reload
const RECONNECT_REQUIRED_FIELDS = ["voice", "nano_banana_enabled"];

export const ConfigurationFormSchema = z.object({
  model: z.nativeEnum(ModelId),
  modalities: z.nativeEnum(ModalitiesId),
  voice: z.nativeEnum(VoiceId),
  temperature: z.number().min(0.6).max(1.2),
  maxOutputTokens: z.number().nullable(),
  nanoBananaEnabled: z.boolean(),
});

export interface ConfigurationFormFieldProps {
  form: UseFormReturn<z.infer<typeof ConfigurationFormSchema>>;
  schema?: typeof ConfigurationFormSchema;
}

export function ConfigurationForm() {
  const { pgState, dispatch } = usePlaygroundState();
  const { connect, disconnect } = useConnection();
  const connectionState = useConnectionState();
  const { localParticipant } = useLocalParticipant();
  const form = useForm<z.infer<typeof ConfigurationFormSchema>>({
    resolver: zodResolver(ConfigurationFormSchema),
    defaultValues: { ...defaultSessionConfig },
    mode: "onChange",
  });
  const formValues = form.watch();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref to track timeout
  const hasConnectedOnceRef = useRef(false); // Track if we've connected once
  const isReconnectingRef = useRef(false); // Track if we're currently reconnecting to prevent loops
  const { toast } = useToast();
  const { agent } = useVoiceAssistant();

  const updateConfig = useCallback(async () => {
    // Don't update if we're currently reconnecting to prevent loops
    if (isReconnectingRef.current) {
      console.log("Skipping config update - reconnection in progress");
      return;
    }

    const values = pgState.sessionConfig;
    const fullInstructions = playgroundStateHelpers.getFullInstructions(pgState);
    const attributes: { [key: string]: string | number | boolean } = {
      gemini_api_key: pgState.geminiAPIKey || "",
      instructions: fullInstructions,
      model: values.model,
      voice: values.voice,
      modalities: values.modalities,
      temperature: values.temperature,
      max_output_tokens: values.maxOutputTokens || "",
      nano_banana_enabled: values.nanoBananaEnabled,
    };
    if (!agent?.identity) {
      return;
    }

    // Skip the very first update right after connection
    // (config was already sent via token)
    if (!hasConnectedOnceRef.current) {
      hasConnectedOnceRef.current = true;
      return;
    }

    // Check if any attributes have changed
    // Convert both to strings for comparison since attributes are stored as strings
    const hasChanges = Object.keys(attributes).some(
      (key) => String(attributes[key]) !== String(localParticipant.attributes[key])
    );

    if (!hasChanges) {
      console.log("no changes");
      return;
    }

    // Check if any critical fields changed that require full reconnection
    const hasCriticalChanges = RECONNECT_REQUIRED_FIELDS.some(
      (key) => String(attributes[key]) !== String(localParticipant.attributes[key])
    );

    //const listOfThingsThatChanged = Object.keys(attributes).filter(key => String(attributes[key]) !== String(localParticipant.attributes[key]));
    //console.log("listOfThingsThatChanged: ", listOfThingsThatChanged);

    if (hasCriticalChanges) {
      console.log("Critical config change detected, triggering reconnection...");
      
      // Set reconnecting flag to prevent update loops
      isReconnectingRef.current = true;
    
      try {
        // Trigger full reconnection
        await disconnect();
        // Small delay to ensure clean disconnect
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Reset the connection flag so the first update after reconnect is skipped
        hasConnectedOnceRef.current = false;
        
        await connect();
        
        // Wait a bit longer for the connection to stabilize and attributes to sync
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({
          title: "Reconnected",
          description: "Session reconnected with new settings.",
          variant: "success",
        });
      } catch (e) {
        toast({
          title: "Reconnection failed",
          description: "Failed to reconnect. Please try manually.",
          variant: "destructive",
        });
      } finally {
        // Always reset the reconnecting flag
        isReconnectingRef.current = false;
      }
      return;
    }

    console.log("has changes, sending RPC");

    try {
      let response = await localParticipant.performRpc({
        destinationIdentity: agent.identity,
        method: "pg.updateConfig",
        payload: JSON.stringify(attributes),
      });
      console.log("pg.updateConfig", response);
      let responseObj = JSON.parse(response);
      if (responseObj.changed) {
        toast({
          title: "Configuration updated",
          variant: "success",
        });
      }
    } catch (e) {
      toast({
        title: "Error Updating Configuration",
        description:
          "There was an error updating your configuration. Please try again.",
        variant: "destructive",
      });
    }
  }, [
    pgState.sessionConfig,
    pgState.instructions,
    pgState.geminiAPIKey,
    localParticipant,
    toast,
    agent?.identity,
    connect,
    disconnect,
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

  // Reset connection flag when disconnected
  useEffect(() => {
    if (connectionState !== ConnectionState.Connected) {
      hasConnectedOnceRef.current = false;
      // Don't reset isReconnectingRef here - it's managed by the reconnection flow
    }
  }, [connectionState]);

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
      handleDebouncedUpdate(); // Call debounced update when form changes
    }

    form.reset(pgState.sessionConfig);
  }, [pgState.sessionConfig, connectionState, handleDebouncedUpdate, form]);

  return (
    <Form {...form}>
      <form className="h-full">
        <div className="flex flex-col h-full">
          <div className="flex-shrink-0 py-4 px-1 border-b border-separator1">
            <div className="text-xs font-bold uppercase tracking-widest text-fg0">
              Configuration
            </div>
          </div>
          <div className="flex-grow overflow-y-auto py-4 pt-4">
            <div className="space-y-5">
              <SessionConfig form={form} />
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
