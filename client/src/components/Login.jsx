// client/src/components/Login.jsx (Optimized Code)
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../features/auth/authApi.js";
import { setCredentials } from "../features/auth/authSlice.js";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Link aur useLocation imported

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const successMsg = location.state?.successMsg;

  // Redux hooks
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const result = await login({ email, password }).unwrap();

      dispatch(
        setCredentials({
          user: result.user,
          token: result.token,
        })
      );

      // ⬅️ FIX: Redirection logic yahan add karein
      navigate("/", { replace: true }); // Home page par redirect karein

      // Login ke baad inputs clear karna
      setEmail("");
      setPassword("");
      console.log("Login successful, user token saved!");
    } catch (err) {
      const errorMessage =
        err?.data?.error || "Login failed. Please check your credentials.";
      setErrorMsg(errorMessage);
      console.error("Login error:", err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          User Login
        </h2>

        {/* --- Message Block (Success ya Error) --- */}
        {(successMsg || errorMsg) && (
          <div
            className={`px-4 py-3 rounded mb-4 border ${
              successMsg
                ? "bg-green-100 border-green-400 text-green-700"
                : "bg-red-100 border-red-400 text-red-700"
            }`}
            role="alert"
          >
            {successMsg || errorMsg}
          </div>
        )}
        {/* Is block ko yahan merge kar diya gaya hai, redundancy khatam */}

        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              placeholder="hamza.test@example.com"
            />
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              placeholder="******************"
            />
          </div>

          {/* Submit Button aur Register Link Block */}
          <div className="flex flex-col items-center">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline disabled:bg-indigo-400 transition duration-150"
            >
              {isLoading ? "Logging In..." : "Sign In"}
            </button>
            <Link
              to="/register"
              className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Don't have an account? Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
