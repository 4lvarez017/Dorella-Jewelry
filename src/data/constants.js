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
  {
    name: "Brazaletes",
    icon: "🪙",
    sub: ["Mujer", "Hombre", "Pareja", "Niñas", "Niños"],
  },
];

// ─── PEDIDOS DE DEMOSTRACIÓN (fallback si Supabase no responde) ───────────────
export const MOCK_ORDERS = [
  {
    id: "DJ-1001",
    customer_name: "María González",
    phone: "3001234567",
    address: "Calle 5 #10-20",
    city: "Ocaña",
    payment_method: "Nequi",
    total: 315000,
    status: "Pendiente",
    items: JSON.stringify([
      { name: "Anillo Eternidad", qty: 1, price: 185000 },
      { name: "Aretes Luna",      qty: 1, price: 95000 },
    ]),
  },
  {
    id: "DJ-1002",
    customer_name: "Carlos Ruiz",
    phone: "3107654321",
    address: "Av. Circunvalar #40-15",
    city: "Montería",
    payment_method: "Transferencia",
    total: 380000,
    status: "Enviado",
    items: JSON.stringify([{ name: "Conjunto Nupcial", qty: 1, price: 380000 }]),
  },
  {
    id: "DJ-1003",
    customer_name: "Laura Pérez",
    phone: "3209876543",
    address: "Carrera 12 #5-30",
    city: "Ocaña",
    payment_method: "Daviplata",
    total: 160000,
    status: "Completado",
    items: JSON.stringify([{ name: "Brazalete Hombre Onix", qty: 1, price: 160000 }]),
  },
];

// ─── CREDENCIALES DE ADMIN ────────────────────────────────────────────────────
// IMPORTANTE: Mover a variables de entorno (.env) antes de producción
export const ADMIN_EMAIL    = "alanalvarez1507@gmail.com";
export const ADMIN_PASSWORD = "Dorellajoyeria26!";

// ─── NÚMERO DE WHATSAPP ───────────────────────────────────────────────────────
export const WHATSAPP_NUMBER = "573132403081";
