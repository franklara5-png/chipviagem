"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { CalculatorSnapshot } from "@/lib/calculator-context";

interface PageAssistContextValue {
  calculator: CalculatorSnapshot | null;
  setCalculator: (snapshot: CalculatorSnapshot | null) => void;
  openChatRequest: number;
  requestOpenChat: () => void;
}

const PageAssistContext = createContext<PageAssistContextValue | null>(null);

export function PageAssistProvider({ children }: { children: ReactNode }) {
  const [calculator, setCalculator] = useState<CalculatorSnapshot | null>(null);
  const [openChatRequest, setOpenChatRequest] = useState(0);

  return (
    <PageAssistContext.Provider
      value={{
        calculator,
        setCalculator,
        openChatRequest,
        requestOpenChat: () => setOpenChatRequest((n) => n + 1),
      }}
    >
      {children}
    </PageAssistContext.Provider>
  );
}

export function usePageAssist() {
  return useContext(PageAssistContext);
}
