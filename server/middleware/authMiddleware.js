// server/middleware/authMiddleware.js

import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  let token;

  // Check 1: Header mein 'Authorization' exist karta hai aur 'Bearer ' se start hota hai
  // Example: Authorization: Bearer <token_string>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Step 1: Token ko 'Bearer ' se alag karna
      token = req.headers.authorization.split(" ")[1];

      // Step 2: Token ko Secret Key se verify aur decode karna
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Step 3: Decoded data (user ID aur email) ko request object mein daalna
      // Ab final route handler (jaise POST /api/orders) ko pata chal jayega ki kaunsa user hai.
      req.user = decoded;

      next(); // Agar sab theek hai, toh agle function/route ko jane do
    } catch (error) {
      console.error("Token verification failed:", error);
      return res.status(401).json({ error: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ error: "Not authorized, no token" });
  }
};

export { protect };
