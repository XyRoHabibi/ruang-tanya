"use client";
import { useEffect, useRef } from "react";
import { AVATARS } from "@/lib/avatars";
import { Avatar } from "./Avatar";

/** Satu baris avatar yang bisa digeser ke samping, supaya tidak memakan tempat. */
export function AvatarPicker({ value, onChange }: { value: number; onChange: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current?.querySelector<HTMLElement>(`[data-i="${value}"]`);
    el?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [value]);
  return (
    <div className="av-pick strip" role="radiogroup" aria-label="Pilih avatar" ref={ref}>
      {AVATARS.map((a, i) => (
        <button
          key={a.name}
          type="button"
          role="radio"
          data-i={i}
          aria-checked={i === value}
          aria-label={a.name}
          title={a.name}
          className={`av-opt ${i === value ? "on" : ""}`}
          onClick={() => onChange(i)}
        >
          <Avatar i={i} />
        </button>
      ))}
    </div>
  );
}
