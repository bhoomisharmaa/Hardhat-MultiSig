import { useState } from "react";

type Toast = {
  id: number;
  message: string;
};

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function showToast(message: string) {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2000);
  }

  return { toasts, showToast };
}
