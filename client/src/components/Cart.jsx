// client/src/components/Cart.jsx
import React from "react";
import {
  useGetCartQuery,
  useAddToCartMutation,
  useDeleteCartItemMutation,
} from "../features/cart/cartApi.js";
import { useNavigate } from "react-router-dom"; // ⬅️ NEW IMPORT
import { usePlaceOrderMutation } from "../features/orders/ordersApi.js"; //

const Cart = () => {
  const navigate = useNavigate(); // ⬅️ useNavigate initialized

  // Cart data fetch karna
  const { data: cartData, isLoading, isError, error } = useGetCartQuery();

  const [placeOrder, { isLoading: isOrdering }] = usePlaceOrderMutation(); // ⬅️ Place Order Hook
  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      alert("Your cart is empty. Cannot checkout.");
      return;
    }

    // Confirmation for user (optional but good practice)
    if (
      !window.confirm(
        `Confirm order for total amount: Rs. ${subtotal.toFixed(2)}?`
      )
    ) {
      return;
    }

    try {
      // 1. Order API call
      const result = await placeOrder().unwrap();

      // 2. Success: User ko Orders page par redirect karna
      alert(`Order Placed Successfully! Order ID: ${result.order.id}`);
      navigate("/orders", { replace: true }); // Orders page par bhej denge
    } catch (err) {
      const errorMsg =
        err?.data?.error || "Failed to place order. Please check stock.";
      alert(`Checkout Error: ${errorMsg}`);
      console.error("Order placement error:", err);
    }
  };

  // Mutations hooks
  const [addToCart] = useAddToCartMutation(); // Quantity increase ke liye re-use karenge
  const [deleteCartItem] = useDeleteCartItemMutation();

  if (isLoading) {
    return (
      <div className="text-center p-8 text-xl text-blue-600">
        Loading your Cart...
      </div>
    );
  }

  if (isError) {
    console.error(error);
    return (
      <div className="text-center p-8 text-red-600">
        Error loading cart details.
      </div>
    );
  }

  const items = cartData?.cart?.items || [];

  // Total calculate karna
  const subtotal = items.reduce(
    (acc, item) => acc + parseFloat(item.price) * item.quantity,
    0
  );

  // --- Handlers ---
  const handleQuantityChange = async (productId, currentQty, type) => {
    let newQuantity = currentQty;

    if (type === "increase") {
      newQuantity += 1;
    } else if (type === "decrease") {
      newQuantity = Math.max(1, currentQty - 1); // Quantity 1 se kam nahi honi chahiye
    }

    // Backend API call. Humne useAddToCartMutation use kiya tha jo quantity ko add karta hai.
    // Isliye hum yahan PUT /api/cart/items/:id ka logic use karenge.
    // NOTE: Humne backend mein POST /api/cart/items ko 'upsert' ke liye banaya tha.
    // Lekin React side se quantity set karna zyada user-friendly hai.
    // Abhi ke liye hum simple 'add' logic use karte hain.
    // Best practice ke liye PUT endpoint (jo humne backend mein banaya tha) use hona chahiye.

    // For simplicity, let's just make the decrease button call DELETE if quantity is 1
    if (type === "decrease" && currentQty === 1) {
      await deleteCartItem(productId).unwrap();
      return;
    }

    // Yahan hum quantity ko set karne ke liye 'PUT /api/cart/items/:product_id' use karenge.
    // WAIT! Humne Cart API slice mein sirf POST/DELETE hooks banaye hain.

    // FIX: Humne Task 15.2 (PUT) aur Task 42.1 (RTK Query) mein PUT hook/logic nahi banaya.
    // Let's assume for now we only have increase (POST - which adds 1 more).

    if (type === "increase") {
      await addToCart({ product_id: productId, quantity: 1 }).unwrap();
    } else if (type === "decrease") {
      // Yahan PUT route chahie, jo abhi missing hai.
      alert(
        "Quantity Decrease functionality requires PUT API endpoint implementation (Next Step)."
      );
      return;
    }
  };

  const handleRemove = async (productId) => {
    try {
      await deleteCartItem(productId).unwrap();
      alert("Item removed!");
    } catch (err) {
      alert("Failed to remove item.");
      console.error(err);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center p-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Your Cart is Empty
        </h2>
        <p className="text-gray-600">Go back to products to start shopping!</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">
        Your Shopping Cart
      </h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items List */}
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <div
              key={item.item_id}
              className="flex items-center bg-white shadow-lg rounded-xl p-4"
            >
              <div className="flex-grow">
                <h3 className="text-xl font-semibold">{item.name}</h3>
                <p className="text-gray-500">
                  Price: Rs. {parseFloat(item.price).toFixed(2)}
                </p>
                <p className="text-lg font-bold mt-1">
                  Total: Rs.{" "}
                  {(parseFloat(item.price) * item.quantity).toFixed(2)}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                {/* Quantity Controls */}
                <button
                  onClick={() =>
                    handleQuantityChange(
                      item.product_id,
                      item.quantity,
                      "decrease"
                    )
                  }
                  className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full hover:bg-gray-300 transition"
                  disabled={item.quantity === 1} // Disable when quantity is 1
                >
                  -
                </button>
                <span className="text-xl font-medium w-6 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    handleQuantityChange(
                      item.product_id,
                      item.quantity,
                      "increase"
                    )
                  }
                  className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full hover:bg-gray-300 transition"
                >
                  +
                </button>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(item.product_id)}
                  className="ml-4 text-red-500 hover:text-red-700 transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3 w-full bg-white p-6 shadow-2xl rounded-xl h-fit">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">
            Order Summary
          </h2>
          <div className="flex justify-between text-lg mb-2">
            <span>Subtotal ({items.length} items):</span>
            <span className="font-semibold">Rs. {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg mb-4 text-green-600">
            <span>Shipping:</span>
            <span className="font-semibold">FREE</span>
          </div>
          <div className="flex justify-between text-2xl font-extrabold border-t pt-4">
            <span>Total:</span>
            <span>Rs. {subtotal.toFixed(2)}</span>
          </div>

          <button
            onClick={handlePlaceOrder} // ⬅️ Handler attach kiya
            disabled={isOrdering || items.length === 0}
            className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition duration-150 disabled:bg-green-400"
          >
            {isOrdering ? "Placing Order..." : "Proceed to Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
