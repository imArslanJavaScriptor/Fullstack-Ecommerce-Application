// client/src/features/products/productsApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Environment variable se API URL lena
const API_URL = import.meta.env.VITE_API_BASE_URL;

// BaseQuery: Yeh har request ke liye base URL aur headers define karta hai
const baseQuery = fetchBaseQuery({
  baseUrl: `${API_URL}/api`, // http://localhost:5000/api
  prepareHeaders: (headers, { getState }) => {
    // Agar humein JWT token chahiye secured routes ke liye
    // Filhaal hum isse khali rakhte hain, baad mein 'auth' slice se token lenge
    return headers;
  },
});

// RTK Query API Slice banana
export const productsApi = createApi({
  reducerPath: "productsApi", // Reducer mein iska naam
  baseQuery,
  tagTypes: ["Product"], // Caching ke liye tags (Baad mein use hoga)
  endpoints: (builder) => ({
    // Endpoint 1: Saare Products GET karna
    getProducts: builder.query({
      query: () => "/products", // Final URL: /api/products
      // providesTags: ['Product'], // Cache tags
    }),

    // Endpoint 2: Single Product GET karna
    getProductById: builder.query({
      query: (id) => `/products/${id}`, // Final URL: /api/products/1
    }),

    // Endpoint 3: Naya Product POST karna (Mutation)
    createProduct: builder.mutation({
      query: (newProductData) => ({
        url: "/products",
        method: "POST",
        body: newProductData,
      }),
      // invalidatesTags: ['Product'], // Mutation ke baad cache refresh karna
    }),

    // Aur yahan baaki mutations (PUT, DELETE) bhi bana sakte hain...
  }),
});

// Hooks export karna
// RTK Query automatically hooks bana deta hai: use<EndpointName><Query/Mutation>
export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
} = productsApi;
