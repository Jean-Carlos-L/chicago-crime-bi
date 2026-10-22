const BASE = import.meta.env.VITE_API_URL;

type Params = Record<string, string | number | undefined | null>;

export async function get<T>(path: string, params: Params = {}, base: string = BASE): Promise<T> {
   const entries = Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== ""
   ) as [string, string | number][];
   const qs = new URLSearchParams(entries.map(([k, v]) => [k, String(v)]));
   const url = `${base}${path}${qs.size ? `?${qs}` : ""}`;

   const res = await fetch(url);
   if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail || `Error ${res.status}`);
   }
   return res.json() as Promise<T>;
}