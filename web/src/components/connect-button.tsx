"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useConnection } from "@/hooks/use-connection";
import { Loader2, ChefHat } from "lucide-react";

export function ConnectButton() {
  const { connect, disconnect, shouldConnect } = useConnection();
  const [connecting, setConnecting] = useState<boolean>(false);

  const handleConnectionToggle = async () => {
    if (shouldConnect) {
      await disconnect();
    } else {
      await initiateConnection();
    }
  };

  const initiateConnection = useCallback(async () => {
    setConnecting(true);
    try {
      await connect();
    } catch (error) {
      console.error("Connection failed:", error);
    } finally {
      setConnecting(false);
    }
  }, [connect]);

  return (
    <Button
      onClick={handleConnectionToggle}
      disabled={connecting}
      variant={shouldConnect ? "destructive" : "default"}
      className="text-sm font-semibold"
      size="sm"
    >
      {connecting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting to Acai...
        </>
      ) : shouldConnect ? (
        <>
          Pause Conversation
        </>
      ) : (
        <>
          <ChefHat className="mr-2 h-4 w-4" />
          Resume Conversation
        </>
      )}
    </Button>
  );
}
