import Plotly from "plotly.js-dist-min";
import createPlotlyComponent from "react-plotly.js/factory";
import type { Data, Layout } from "plotly.js-dist-min";
import { PLOTLY_BASE_LAYOUT } from "../theme/plotlyTheme";

const PlotlyPlot = createPlotlyComponent(Plotly);

interface Props {
   data: Data[];
   layout?: Partial<Layout>;
   height?: number;
   scrollZoom?: boolean;
}

export default function Plot({ data, layout = {}, height = 360, scrollZoom = false }: Props) {
   const mergedLayout: Partial<Layout> = {
      ...PLOTLY_BASE_LAYOUT,
      ...layout,
      margin: { ...PLOTLY_BASE_LAYOUT.margin, ...layout.margin },
      xaxis: { ...PLOTLY_BASE_LAYOUT.xaxis, ...layout.xaxis },
      yaxis: { ...PLOTLY_BASE_LAYOUT.yaxis, ...layout.yaxis },
   };

   return (
      <div className="min-w-0 w-full" style={{ height }}>
         <PlotlyPlot
            data={data}
            layout={mergedLayout}
            config={{ displayModeBar: false, responsive: true, scrollZoom }}
            style={{ width: "100%", height: "100%" }}
            useResizeHandler
         />
      </div>
   );
}
