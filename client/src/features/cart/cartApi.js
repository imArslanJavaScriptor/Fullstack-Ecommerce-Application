// client/src/features/cart/cartApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_API_BASE_URL;

// BaseQuery ko thoda change karte hain taki woh JWT token automatically bhej sake.
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: `${API_URL}/api`,
  prepareHeaders: (headers, { getState }) => {
    // 1. Redux state se token nikalna: AUTH SLICE ZAROORI HAI
    const token = getState().auth.token; // ⬅️ CONFIRM: Kya yeh path sahi hai?

    // 2. Authorization header mein set karna
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: baseQueryWithAuth, // Ab har request auth header ke saath jayegi
  tagTypes: ["Cart"], // Caching tag
  endpoints: (builder) => ({
    // Endpoint 1: Cart Items GET karna
    getCart: builder.query({
      query: () => "/cart", // GET /api/cart
      providesTags: ["Cart"],
    }),

    // Endpoint 2: Item Cart mein Add karna (ya Quantity badhana)
    addToCart: builder.mutation({
      query: ({ product_id, quantity }) => ({
        url: "/cart/items", // POST /api/cart
        method: "POST",
        body: { product_id, quantity }, // Backend ko ye data chahiye
      }),
      // Jab item add ho, toh Cart data ko dobara fetch karein ya cache ko invalidate karein
      invalidatesTags: ["Cart"],
    }),

    // Endpoint 3: Cart Item ki Quantity Update karna
    updateCartItem: builder.mutation({
      query: ({ product_id, quantity }) => ({
        url: "/cart", // PUT /api/cart
        method: "PUT",
        body: { product_id, quantity },
      }),
      invalidatesTags: ["Cart"],
    }),

    // Endpoint 4: Cart Item Delete karna
    deleteCartItem: builder.mutation({
      query: (product_id) => ({
        url: "/cart", // DELETE /api/cart
        method: "DELETE",
        body: { product_id }, // DELETE request mein body bhi bhej sakte hain
      }),
      invalidatesTags: ["Cart"],
    }),
  }),
});

// Hooks export karna
export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useDeleteCartItemMutation,
} = cartApi;
