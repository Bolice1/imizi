"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AlertTriangle, X } from "lucide-react";

type Toast = { id: number; message: string };

type ConfirmState = {
  message: string;
  onConfirm: () => void;
  resolve: (value: boolean) => void;
};

type UiFeedbackContextValue = {
  toast: (message: string) => void;
  confirm: (message: string) => Promise<boolean>;
};

const UiFeedbackContext = createContext<UiFeedbackContextValue | null>(null);

export function UiFeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const toast = useCallback((message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 1800);
  }, []);

  const confirm = useCallback((message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        message,
        onConfirm: () => {
          setConfirmState(null);
          resolve(true);
        },
        resolve: (value: boolean) => {
          setConfirmState(null);
          resolve(value);
        },
      });
    });
  }, []);

  return (
    <UiFeedbackContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Toasts */}
      <div className="fixed inset-0 z-[60] pointer-events-none">
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {toasts.map((item) => (
            <div
              key={item.id}
              className="pointer-events-auto bg-[#3A2E22] text-white text-sm px-4 py-2.5 rounded-xl shadow-lg border border-[#EDE3D3]"
            >
              {item.message}
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation dialog */}
      {confirmState && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => confirmState.resolve(false)}
        >
          <div
            className="bg-[#FFFDFA] rounded-3xl border border-[#EDE3D3] w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE3D3]">
              <h3 className="text-lg font-semibold text-[#3A2E22]">Confirm delete</h3>
              <button
                onClick={() => confirmState.resolve(false)}
                className="p-1.5 hover:bg-[#F5EFE6] rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-[#8B5E3C]" />
              </button>
            </div>
            <div className="px-6 py-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-sm text-[#3A2E22] leading-relaxed">{confirmState.message}</p>
            </div>
            <div className="px-6 py-4 border-t border-[#EDE3D3] flex gap-3">
              <button
                onClick={() => confirmState.resolve(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#EDE3D3] text-sm font-medium text-[#3A2E22] hover:bg-[#F5EFE6] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmState.onConfirm}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </UiFeedbackContext.Provider>
  );
}

export function useUiFeedback() {
  const ctx = useContext(UiFeedbackContext);
  if (!ctx) {
    throw new Error("useUiFeedback must be used within UiFeedbackProvider");
  }
  return ctx;
}
