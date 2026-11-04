"use client";
import { useCallback, useRef, useState } from "react";

export function useToast() {
  const [msg, setMsg] = useState("");
  const [show, setShow] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toast = useCallback((m: string) => {
    setMsg(m);
    setShow(true);
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => setShow(false), 2800);
  }, []);
  const node = <div className={`toast ${show ? "show" : ""}`} role="status" aria-live="polite">{msg}</div>;
  return { toast, node };
}
