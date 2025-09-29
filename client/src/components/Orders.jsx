// client/src/components/Orders.jsx
import React from "react";
import { useGetUserOrdersQuery } from "../features/orders/ordersApi.js";

const Orders = () => {
  const { data: orders, isLoading, isError, error } = useGetUserOrdersQuery();

  if (isLoading) {
    return (
      <div className="text-center p-8 text-xl text-blue-600">
        Loading Order History...
      </div>
    );
  }

  if (isError) {
    console.error(error);
    return (
      <div className="text-center p-8 text-red-600">Error fetching orders.</div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center p-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          You Haven't Placed Any Orders
        </h2>
        <p className="text-gray-600">Start shopping now!</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">
        Your Order History
      </h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white shadow-xl rounded-xl p-6 border-l-4 border-indigo-500"
          >
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-2xl font-extrabold text-gray-900">
                Order #{order.id}
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  order.status === "Processing"
                    ? "bg-yellow-100 text-yellow-800"
                    : order.status === "Delivered"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {order.status}
              </span>
            </div>

            <div className="text-lg mb-2">
              <span className="font-semibold">Order Date:</span>{" "}
              {new Date(order.order_date).toLocaleDateString()}
            </div>
            <div className="text-3xl font-bold text-indigo-600">
              <span className="text-xl font-semibold text-gray-700">
                Total:
              </span>{" "}
              Rs. {parseFloat(order.total_amount).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
