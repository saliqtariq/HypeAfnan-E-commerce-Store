"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { useParams } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ToastMessage {
  id: number;
  text: string;
}

interface AppContextValue {
  /** Current locale from the URL, e.g. "en", "ar" */
  locale: string;
  /** Copy a string to clipboard and show a brief toast */
  copyToClipboard: (text: string, label?: string) => void;
  /** Active toast messages */
  toasts: ToastMessage[];
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextValue>({
  locale: "en",
  copyToClipboard: () => {},
  toasts: [],
});

// ─── Provider ────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const locale = useMemo(
    () => (params?.locale as string) || "en",
    [params?.locale]
  );

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Auto-dismiss toasts after 2 seconds
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 2000);
    return () => clearTimeout(timer);
  }, [toasts]);

  const copyToClipboard = useCallback((text: string, label = "Copied!") => {
    navigator.clipboard?.writeText(text).catch(() => {});
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text: label }]);
  }, []);

  const value = useMemo(
    () => ({ locale, copyToClipboard, toasts }),
    [locale, copyToClipboard, toasts]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      {/* Global Toast Overlay */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="px-4 py-2 bg-gray-900 text-white text-[13px] font-medium rounded-full shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              ✓ {toast.text}
            </div>
          ))}
        </div>
      )}
    </AppContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAppContext() {
  return useContext(AppContext);
}
