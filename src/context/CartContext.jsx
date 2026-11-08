import { createContext, useContext, useReducer, useEffect } from "react";

const CART_STORAGE_KEY = "dorella_cart_v1";

function loadInitialCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ─── REDUCER ─────────────────────────────────────────────────────────────────
function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const item = action.item || action.payload;
      if (!item) return state;
      const exists = state.find((i) => i.id === item.id);
      if (exists)
        return state.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + 1 } : i
        );
      return [...state, { ...item, qty: 1 }];
    }
    case "ADD_MULTIPLE": {
      const exists = state.find((i) => i.id === action.item.id);
      if (exists)
        return state.map((i) =>
          i.id === action.item.id ? { ...i, qty: i.qty + action.qty } : i
        );
      return [...state, { ...action.item, qty: action.qty }];
    }
    case "REMOVE":
      return state.filter((i) => i.id !== action.id);
    case "UPDATE_QTY":
      return state
        .map((i) => (i.id === action.id ? { ...i, qty: action.qty } : i))
        .filter((i) => i.qty > 0);
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

// ─── CONTEXT ──────────────────────────────────────────────────────────────────
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, undefined, loadInitialCart);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      /* ignore storage quota errors */
    }
  }, [cart]);

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  return (
    <CartContext.Provider value={{ cart, dispatch, total }}>
      {children}
    </CartContext.Provider>
  );
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────
export const useCart = () => useContext(CartContext);
