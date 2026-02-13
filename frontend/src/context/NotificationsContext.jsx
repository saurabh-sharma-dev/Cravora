import React, { createContext, useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export const NotificationsContext = createContext({
  add: () => {},
  remove: () => {},
  clear: () => {},
});

const genId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const NotificationsProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((toast) => {
    const id = toast.id || genId();
    const t = { id, timeout: 4000, ...toast };
    setToasts((prev) => [...prev, t]);
    if (t.timeout) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id));
      }, t.timeout);
    }
  }, []);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const clear = useCallback(() => setToasts([]), []);

  const value = useMemo(() => ({ add, remove, clear }), [add, remove, clear]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`rounded-xl shadow-card border p-3 bg-white ${
                t.type === "success" ? "border-emerald-200 bg-emerald-50/50" : t.type === "error" ? "border-red-200 bg-red-50/50" : "border-stone-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  {t.title && <div className="text-sm font-semibold text-gray-800">{t.title}</div>}
                  {t.message && <div className="text-sm text-gray-600">{t.message}</div>}
                  {t.action && (
                    <button onClick={t.action.onClick} className="mt-1 text-sm text-blue-600 hover:underline">
                      {t.action.label}
                    </button>
                  )}
                </div>
                <button onClick={() => remove(t.id)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationsContext.Provider>
  );
};