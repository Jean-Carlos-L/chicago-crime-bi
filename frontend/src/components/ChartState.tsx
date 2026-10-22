import type { ReactNode } from "react";

interface Props {
   children: ReactNode;
   tone?: "muted" | "error";
   height?: number;
}

export default function ChartState({ children, tone = "muted", height = 360 }: Props) {
   return (
      <div
         role={tone === "error" ? "alert" : undefined}
         className={`flex items-center justify-center px-4 text-center text-sm ${tone === "error" ? "text-bad" : "text-muted"}`}
         style={{ height }}
      >
         {children}
      </div>
   );
}
