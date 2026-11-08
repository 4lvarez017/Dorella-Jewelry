// ─── CATÁLOGO DE PRODUCTOS (MODULARIZADO) ───────────────────────────────────────
import { ANILLOS } from "./products/anillos";
import { ARETES } from "./products/aretes";
import { CADENAS } from "./products/cadenas";
import { PULSERAS } from "./products/pulseras";
import { DIJES } from "./products/dijes";
import { BRAZALETES_HOMBRE } from "./products/brazaletes_hombre";
import { BRAZALETES_PAREJA } from "./products/brazaletes_pareja";
import { ROSARIOS } from "./products/rosarios";
import { CONJUNTOS } from "./products/conjuntos";
import { HERRAJES } from "./products/herrajes";
import { CRUCEROS } from "./products/cruceros";
import { BRAZALETES_NINAS } from "./products/brazaletes_ninas";
import { BRAZALETES_MUJER } from "./products/brazaletes_mujer";
import { BRAZALETES_NINOS } from "./products/brazaletes_ninos";
import { TOBILLERAS } from "./products/tobilleras";

export const PRODUCTS = [
  ...ANILLOS,
  ...ARETES,
  ...CADENAS,
  ...PULSERAS,
  ...DIJES,
  ...BRAZALETES_HOMBRE,
  ...BRAZALETES_PAREJA,
  ...ROSARIOS,
  ...CONJUNTOS,
  ...HERRAJES,
  ...CRUCEROS,
  ...BRAZALETES_NINAS,
  ...BRAZALETES_MUJER,
  ...BRAZALETES_NINOS,
  ...TOBILLERAS,
];

// ─── CATEGORÍAS DE NAVEGACIÓN ─────────────────────────────────────────────────
export const CATEGORIES = [
  { name: "Anillos",    icon: "💍" },
  { name: "Conjuntos",  icon: "✨" },
  { name: "Dijes",      icon: "🔮" },
  { name: "Herrajes",   icon: "⚙️" },
  { name: "Cruceros",   icon: "⚓" },
  { name: "Aretes",     icon: "🌙" },
  { name: "Cadenas",    icon: "🔗" },
  { name: "Pulseras",   icon: "💎" },
  { name: "Rosarios",   icon: "📿" },
  { name: "Tobilleras", icon: "🦶" },
  {
    name: "Brazaletes",
    icon: "🪙",
    sub: ["Mujer", "Hombre", "Pareja", "Niñas", "Niños"],
  },
];

// ─── NÚMERO DE WHATSAPP ───────────────────────────────────────────────────────
export const WHATSAPP_NUMBER = "573132403081";


