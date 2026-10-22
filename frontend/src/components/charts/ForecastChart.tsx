import { useTypeSeries } from "../../api/hooks";
import ChartState from "../ChartState";
import Plot from "../Plot";

interface Props { primaryType: string; historyMonths: 6 | 12 }

export default function ForecastChart({ primaryType, historyMonths }: Props) {
   const { data, isLoading, error } = useTypeSeries(primaryType);
   if (isLoading) return <ChartState>Cargando…</ChartState>;
   if (error) return <ChartState tone="error">Error: {error.message}</ChartState>;
   if (!data) return null;

   const hist = data.history.slice(-historyMonths);
   const last = hist[hist.length - 1];
   const fx = data.forecast.map((f) => f.month);

   return (
      <Plot
         height={380}
         data={[
            {
               x: fx, y: data.forecast.map((f) => f.hi), type: "scatter", mode: "lines",
               line: { width: 0 }, hoverinfo: "skip", showlegend: false
            },
            {
               x: fx, y: data.forecast.map((f) => f.lo), type: "scatter", mode: "lines",
               line: { width: 0 }, fill: "tonexty", fillcolor: "rgba(245,158,11,0.18)",
               name: "Intervalo 80 %", hoverinfo: "skip"
            },
            {
               x: hist.map((h) => h.month), y: hist.map((h) => h.total), type: "scatter",
               mode: "lines+markers", name: "Real", line: { color: "#60A5FA", width: 2.5 }
            },
            {
               x: [last.month, ...fx], y: [last.total, ...data.forecast.map((f) => f.forecast)],
               type: "scatter", mode: "lines+markers", name: "Pronóstico",
               line: { color: "#F59E0B", width: 2.5, dash: "dot" }
            },
         ]}
         layout={{
            yaxis: { title: { text: "Registros por mes" }, rangemode: "tozero" },
            xaxis: { type: "date", tickformat: "%b %Y" },
            legend: { orientation: "h", y: 1.12 },
         }}
      />
   );
}