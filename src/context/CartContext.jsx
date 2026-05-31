import { createContext, useContext, useReducer } from "react";

// ─── REDUCER ─────────────────────────────────────────────────────────────────
function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const exists = state.find((i) => i.id === action.item.id);
      if (exists)
        return state.map((i) =>
          i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i
        );
      return [...state, { ...action.item, qty: 1 }];
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
  const [cart, dispatch] = useReducer(cartReducer, []);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  return (
    <CartContext.Provider value={{ cart, dispatch, total }}>
      {children}
    </CartContext.Provider>
  );
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────
export const useCart = () => useContext(CartContext);
