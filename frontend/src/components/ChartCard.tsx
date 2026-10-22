import type { ReactNode } from "react";
import Card from "./Card";

interface Props {
   title: string;
   subtitle?: string;
   actions?: ReactNode;
   children: ReactNode;
}

export default function ChartCard({ title, subtitle, actions, children }: Props) {
   return (
      <Card>
         <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
               <h3 className="text-base font-semibold text-text">{title}</h3>
               {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
            </div>
            {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
         </div>
         {children}
      </Card>
   );
}
