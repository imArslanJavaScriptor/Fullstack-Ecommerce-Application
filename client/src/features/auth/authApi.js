// client/src/features/auth/authApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/auth`, // Base URL: /api/auth
  }),
  endpoints: (builder) => ({
    // Endpoint 1: Login (Mutation)
    login: builder.mutation({
      query: (credentials) => ({
        url: "/login", // Final URL: /api/auth/login
        method: "POST",
        body: credentials,
      }),
    }),

    // Endpoint 2: Signup (Mutation)
    signup: builder.mutation({
      query: (userData) => ({
        url: "/signup", // Final URL: /api/auth/signup
        method: "POST",
        body: userData,
      }),
    }),
  }),
});

// Hooks export karna
export const { useLoginMutation, useSignupMutation } = authApi;
