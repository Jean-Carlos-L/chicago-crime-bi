import type { ReactNode } from "react";

export default function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
   return (
      <section
         className={`min-w-0 rounded-xl border border-border bg-surface p-4 shadow-sm shadow-black/30 ${className}`}
      >
         {children}
      </section>
   );
}
