"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useConnection } from "@/hooks/use-connection";
import { Loader2, PhoneCall, Settings } from "lucide-react";
import { usePlaygroundState } from "@/hooks/use-playground-state";
import { AuthDialog } from "./auth";

export function ConnectButton() {
  const { connect, disconnect, shouldConnect } = useConnection();
  const [connecting, setConnecting] = useState<boolean>(false);
  const { pgState } = usePlaygroundState();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [initiateConnectionFlag, setInitiateConnectionFlag] = useState(false);

  const handleConnectionToggle = async () => {
    if (shouldConnect) {
      await disconnect();
    } else {
      if (!pgState.geminiAPIKey) {
        setShowAuthDialog(true);
      } else {
        await initiateConnection();
      }
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

  const handleAuthComplete = () => {
    setShowAuthDialog(false);
    setInitiateConnectionFlag(true);
  };

  useEffect(() => {
    if (initiateConnectionFlag && pgState.geminiAPIKey) {
      initiateConnection();
      setInitiateConnectionFlag(false);
    }
  }, [initiateConnectionFlag, initiateConnection, pgState.geminiAPIKey]);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          onClick={handleConnectionToggle}
          disabled={connecting || shouldConnect}
          variant="primary"
          className="text-sm font-semibold p-2 h-9"
        >
          {connecting || shouldConnect ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting
            </>
          ) : (
            <>
              <PhoneCall className="h-4 w-4 mr-2" />
              Start a conversation with Gemini
            </>
          )}
        </Button>
        {!shouldConnect && !connecting && pgState.geminiAPIKey && (
          <Button
            onClick={() => setShowAuthDialog(true)}
            variant="outline"
            size="icon"
            className="h-9 w-9"
            title="Change API Key"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </div>
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onAuthComplete={handleAuthComplete}
      />
    </>
  );
}
