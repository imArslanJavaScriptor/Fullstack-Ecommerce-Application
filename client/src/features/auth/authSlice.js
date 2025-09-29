// client/src/features/auth/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Initial state mein local storage se token aur user data load karna
// Taki refresh ke baad bhi user logged in rahe
const initialState = {
  token: localStorage.getItem("token") || null,
  user: JSON.parse(localStorage.getItem("user")) || null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // 1. Login Reducer: Token aur user data save karna
    setCredentials: (state, action) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      localStorage.setItem("token", token); // Local Storage mein save karna
      localStorage.setItem("user", JSON.stringify(user));
    },
    // 2. Logout Reducer: State aur Local Storage clear karna
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

// Selector: Isse hum components mein login status check kar sakte hain
export const selectCurrentToken = (state) => state.auth.token;

export default authSlice.reducer;
