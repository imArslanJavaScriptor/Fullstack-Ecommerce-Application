// client/src/app/store.js (Updated)
import { configureStore } from "@reduxjs/toolkit";
import { productsApi } from "../features/products/productsApi.js";
import { authApi } from "../features/auth/authApi.js";
import { cartApi } from "../features/cart/cartApi.js";
import { ordersApi } from "../features/orders/ordersApi.js"; // ⬅️ NEW IMPORT
import authReducer from "../features/auth/authSlice.js";

export const store = configureStore({
  reducer: {
    // 1. Regular Slice
    auth: authReducer,

    // 2. API Slices
    [productsApi.reducerPath]: productsApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer, // ⬅️ NEW
  },
  // 3. Middleware: Chaaron APIs ka middleware concat karna
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      productsApi.middleware,
      authApi.middleware,
      cartApi.middleware,
      ordersApi.middleware // ⬅️ NEW
    ),
});
