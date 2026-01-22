"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AiContextType {
  aiToken: string | null;
  generate: (prompt: string, context?: string) => Promise<string | null>;
  isLoading: boolean;
}

const AiContext = createContext<AiContextType | undefined>(undefined);

export const AiProvider = ({ children }: { children: React.ReactNode }) => {
  // We set a 'dummy' token to satisfy your AiEditorWrapper condition
  const [aiToken, setAiToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simulate 'auth' success immediately since we are using our own key
    setAiToken("AIzaSyCptxzJRtAHORkke8k93GEMC4ifN3ySdPo");
  }, []);

  const generate = async (prompt: string, textContext?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, text: textContext }),
      });
      const data = await response.json();
      return data.result;
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AiContext.Provider value={{ aiToken, generate, isLoading }}>
      {children}
    </AiContext.Provider>
  );
};

export const useAi = () => {
  const context = useContext(AiContext);
  if (!context) throw new Error("useAi must be used within AiProvider");
  return context;
};
