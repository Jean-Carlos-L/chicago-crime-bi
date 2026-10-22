export const fmt = (n: number | null | undefined, digits = 0) =>
   n == null
      ? null
      : Number(n).toLocaleString("es-CO", {
         minimumFractionDigits: digits,
         maximumFractionDigits: digits,
      });

export const pct = (n: number | null | undefined) =>
   n == null ? null : `${fmt(n, 1)} %`;

// "20250131" <-> "2025-01-31"
export const keyToIso = (k: string) =>
   k && k.length === 8 ? `${k.slice(0, 4)}-${k.slice(4, 6)}-${k.slice(6)}` : "";
export const isoToKey = (iso: string) => iso.replaceAll("-", "");

// "20250131" -> "31/01/2025"
export const keyToDisplay = (k: string) => {
   const iso = keyToIso(k);
   if (!iso) return "";
   const [year, month, day] = iso.split("-");
   return `${day}/${month}/${year}`;
};

export const GROUP_LABEL: Record<string, string> = {
   VIOLENT: "Violentos",
   NON_VIOLENT: "No violentos",
   OTHER: "Otros",
};

export const DAY_LABEL = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];