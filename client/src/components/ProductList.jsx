// client/src/components/ProductList.jsx (Updated)
import React from "react";
import { useGetProductsQuery } from "../features/products/productsApi.js";
import { useAddToCartMutation } from "../features/cart/cartApi.js"; // ⬅️ NEW IMPORT

const ProductList = () => {
  const { data: products, isLoading, isError, error } = useGetProductsQuery();
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation(); // ⬅️ Mutation hook

  if (isLoading) {
    return (
      <div className="text-center p-8 text-xl text-blue-600">
        Loading products...
      </div>
    );
  }

  if (isError) {
    console.error(error);
    return (
      <div className="text-center p-8 text-red-600">
        Error fetching products.
      </div>
    );
  }

  // --- Add to Cart Handler ---
  const handleAddToCart = async (product_id) => {
    try {
      // Default quantity 1 bhejte hain
      await addToCart({ product_id, quantity: 1 }).unwrap();
      alert("Product added to cart!");
      // Ab, RTK Query automatically Cart data ko refresh karega due to invalidatesTags: ['Cart']
    } catch (err) {
      const errorMsg = err?.data?.error || "Failed to add item to cart.";
      alert(`Error: ${errorMsg}`);
      console.error("Cart add error:", err);
    }
  };
  // --------------------------

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">
        E-commerce Product Listing
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white shadow-lg rounded-xl p-5 transition duration-300 hover:shadow-2xl"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {product.name}
            </h2>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {product.description}
            </p>
            <div className="flex justify-between items-center mt-4">
              <span className="text-2xl font-bold text-green-700">
                Rs. {parseFloat(product.price).toFixed(2)}
              </span>
              <button
                onClick={() => handleAddToCart(product.id)} // ⬅️ Handler attach kiya
                disabled={isAdding} // Button ko disable karein jab request jaa rahi ho
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-150 disabled:bg-indigo-400"
              >
                {isAdding ? "Adding..." : "Add to Cart"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
