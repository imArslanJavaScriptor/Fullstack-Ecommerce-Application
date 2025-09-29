// client/src/features/orders/ordersApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Re-using the authenticated baseQuery
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: `${API_URL}/api`,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Order"], // Caching tag
  endpoints: (builder) => ({
    // Endpoint 1: Order Place Karna (Checkout)
    placeOrder: builder.mutation({
      query: () => ({
        url: "/orders", // POST /api/orders
        method: "POST",
        // Body ki zaroorat nahi hai, backend Cart se data leta hai
      }),
      // Order place hone ke baad, cart clear ho jaata hai.
      // Isliye, hum Cart cache ko invalidate karenge.
      invalidatesTags: ["Cart", "Order"],
    }),

    // Endpoint 2: User ke Orders Fetch Karna
    getUserOrders: builder.query({
      query: () => "/orders", // GET /api/orders
      providesTags: ["Order"],
    }),

    // Aur bhi endpoints jaise getOrderById, cancelOrder yahan bana sakte hain...
  }),
});

// Hooks export karna
export const { usePlaceOrderMutation, useGetUserOrdersQuery } = ordersApi;
