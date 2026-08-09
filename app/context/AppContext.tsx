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
  /** Trigger a toast message anywhere in the app */
  showToast: (text: string) => void;
  /** Active toast messages */
  toasts: ToastMessage[];
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextValue>({
  locale: "en",
  copyToClipboard: () => {},
  showToast: () => {},
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

  const showToast = useCallback((text: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text }]);
  }, []);

  const copyToClipboard = useCallback((text: string, label = "Copied!") => {
    navigator.clipboard?.writeText(text).catch(() => {});
    showToast(label);
  }, [showToast]);

  const value = useMemo(
    () => ({ locale, copyToClipboard, showToast, toasts }),
    [locale, copyToClipboard, showToast, toasts]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      {/* Global Toast Overlay - Bottom Right Corner */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-[99999] flex flex-col items-end gap-2.5 pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="px-4 py-3 bg-[#111827] text-white text-[13.5px] font-medium rounded-2xl shadow-2xl border border-gray-800/80 animate-in fade-in slide-in-from-bottom-4 duration-250 flex items-center gap-3 min-w-[220px]"
            >
              <div className="w-6 h-6 rounded-full bg-[#38c172]/20 flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38c172" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className="leading-snug">{toast.text}</span>
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
