import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useIsFetching } from "@tanstack/react-query";
import { useFilterOptions, useSummary } from "./api/hooks";
import FilterBar from "./components/FilterBar";
import { fmt, keyToDisplay } from "./utils/format";
import About from "./pages/About";
import CrimeTypes from "./pages/CrimeTypes";
import Geographic from "./pages/Geographic";
import Overview from "./pages/Overview";
import Temporal from "./pages/Temporal";

const TABS = [
   { id: "resumen", label: "Resumen" },
   { id: "tipos", label: "Tipos de delito" },
   { id: "temporal", label: "Análisis temporal" },
   { id: "geografico", label: "Geográfico" },
   { id: "metodologia", label: "Metodología" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const isTabId = (value: string): value is TabId => TABS.some((tab) => tab.id === value);

const readHash = (): TabId => {
   const value = window.location.hash.replace(/^#/, "");
   return isTabId(value) ? value : "resumen";
};

function Page({ id }: { id: TabId }) {
   switch (id) {
      case "resumen":
         return <Overview />;
      case "tipos":
         return <CrimeTypes />;
      case "temporal":
         return <Temporal />;
      case "geografico":
         return <Geographic />;
      case "metodologia":
         return <About />;
   }
}

export default function App() {
   const [tab, setTab] = useState<TabId>(readHash);
   const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
   const { data: options } = useFilterOptions();
   const { data: summary } = useSummary();
   const fetching = useIsFetching();

   useEffect(() => {
      window.history.replaceState(null, "", `#${readHash()}`);

      const onLocationChange = () => setTab(readHash());
      window.addEventListener("hashchange", onLocationChange);
      window.addEventListener("popstate", onLocationChange);
      return () => {
         window.removeEventListener("hashchange", onLocationChange);
         window.removeEventListener("popstate", onLocationChange);
      };
   }, []);

   const selectTab = (id: TabId) => {
      setTab(id);
      if (window.location.hash !== `#${id}`) {
         window.history.pushState(null, "", `#${id}`);
      }
   };

   const onTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      const index = TABS.findIndex((item) => item.id === tab);
      let next = index;

      if (event.key === "ArrowRight") next = (index + 1) % TABS.length;
      else if (event.key === "ArrowLeft") next = (index - 1 + TABS.length) % TABS.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = TABS.length - 1;
      else return;

      event.preventDefault();
      const nextId = TABS[next].id;
      selectTab(nextId);
      requestAnimationFrame(() => {
         const element = tabRefs.current[next];
         element?.focus();
         element?.scrollIntoView({ block: "nearest", inline: "nearest" });
      });
   };

   const range =
      options && options.date_range.min && options.date_range.max
         ? `${keyToDisplay(options.date_range.min)} – ${keyToDisplay(options.date_range.max)}`
         : "—";

   return (
      <div className="min-h-screen">
         <div className="sticky top-0 z-40 border-b border-border bg-bg/95 backdrop-blur-md">
            <header className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
               <div className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                     <h1 className="text-lg font-semibold tracking-tight text-text sm:text-xl">
                        Crímenes en Chicago
                     </h1>
                     <p className="text-xs text-muted">Dashboard BI · 2021–actualidad</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                     <div className="text-right">
                        <div className="text-[10px] font-medium uppercase tracking-wide text-muted">
                           Total de delitos
                        </div>
                        <div className="text-sm font-semibold tabular-nums text-text">
                           {summary ? fmt(summary.total) : "—"}
                        </div>
                     </div>
                     <div className="hidden h-8 w-px bg-border sm:block" aria-hidden="true" />
                     <div className="text-right">
                        <div className="text-[10px] font-medium uppercase tracking-wide text-muted">
                           Datos disponibles
                        </div>
                        <div className="text-sm font-medium tabular-nums text-text">{range}</div>
                     </div>
                  </div>
               </div>
            </header>

            <div className="h-0.5 overflow-hidden bg-transparent">
               {fetching > 0 && (
                  <>
                     <div className="loading-bar h-0.5 w-1/3 rounded-full bg-primary" aria-hidden="true" />
                     <span role="status" className="sr-only">
                        Actualizando…
                     </span>
                  </>
               )}
            </div>

            <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
               <div
                  role="tablist"
                  aria-label="Secciones del dashboard"
                  onKeyDown={onTabKeyDown}
                  className="flex gap-1 overflow-x-auto border-b border-border"
               >
                  {TABS.map((item, index) => {
                     const active = item.id === tab;
                     return (
                        <button
                           key={item.id}
                           ref={(el) => {
                              tabRefs.current[index] = el;
                           }}
                           id={`tab-${item.id}`}
                           role="tab"
                           type="button"
                           aria-selected={active}
                           aria-controls={`panel-${item.id}`}
                           tabIndex={active ? 0 : -1}
                           onClick={() => selectTab(item.id)}
                           className={`-mb-px whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${
                              active
                                 ? "border-primary font-semibold text-primary-soft"
                                 : "border-transparent text-muted hover:border-border hover:text-text"
                           }`}
                        >
                           {item.label}
                        </button>
                     );
                  })}
               </div>
            </div>

            <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
               <FilterBar />
            </div>
         </div>

         <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
            <div
               role="tabpanel"
               id={`panel-${tab}`}
               aria-labelledby={`tab-${tab}`}
               tabIndex={0}
               className="outline-none"
            >
               <Page id={tab} />
            </div>
         </main>
      </div>
   );
}
