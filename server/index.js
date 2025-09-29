// server/index.js
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { protect } from "./middleware/authMiddleware.js";

// 1. Dependencies import karna (ES Modules syntax)
import dotenv from "dotenv";
import express from "express";
import cors from "cors"; // ⬅️ NEW IMPORT
import pg from "pg";

// dotenv.config();
// __dirname equivalent (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ Explicitly point to root .env
dotenv.config({ path: join(__dirname, "../.env") });

// 2. pg se Client class nikalna
const { Client } = pg;

const app = express();

// CORS Middleware Add Karein (Middleware section mein)
// Ye line zaroori hai!
app.use(
  cors({
    origin: "http://localhost:5173", // Sirf apne Frontend URL ko allow karein
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
    credentials: true, // Cookies aur Authorization headers allow karein
  })
);

// process.env se values nikalna
const PORT = process.env.PORT || 5000;

// Middleware: JSON requests ko handle karne ke liye
app.use(express.json());

// 3. Database Configuration (ESM mein same rahega)
const dbClient = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// console.log("DB Client:", dbClient);
// Database Connection attempt
dbClient
  .connect()
  .then(() => {
    console.log("✅ Database connected successfully!");

    // Basic test route
    app.get("/", (req, res) => {
      res.json({
        message: "Welcome to the E-commerce Backend API!",
        db_status: "Connected",
      });
    });

    // Product Routes (CREATE-R-U-D) - Abhi hum isko function mein daalenge

    // 4. Server Start (Jab DB connect ho jaye)
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`Access: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(
      "❌ Database connection error. Please check .env and PGAdmin:",
      err.stack
    );
    process.exit(1);
  });

/* -------------------------------------------------------------------------- */
/* 5. PRODUCT API ROUTES                             */
/* -------------------------------------------------------------------------- */

// 5. CREATE Product (POST /api/products)
app.post("/api/products", protect, async (req, res) => {
  const { name, description, price, stock_quantity } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: "Name and price are required." });
  }

  try {
    const query = `
            INSERT INTO products (name, description, price, stock_quantity)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
    const values = [name, description || "", price, stock_quantity || 0];

    const result = await dbClient.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating product:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// server/index.js (Continuation of API Routes)

// 2. READ All Products (GET /api/products)
app.get("/api/products", async (req, res) => {
  try {
    const query = "SELECT * FROM products ORDER BY id ASC;";
    const result = await dbClient.query(query);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching all products:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 3. READ Single Product (GET /api/products/:id)
app.get("/api/products/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const query = "SELECT * FROM products WHERE id = $1;";
    const result = await dbClient.query(query, [id]); // [id] values array hai

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`Error fetching product ID ${id}:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 4. UPDATE Product (PUT /api/products/:id)
app.put("/api/products/:id", protect, async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock_quantity } = req.body;

  try {
    // COALESCE() method: Agar naya data nahi aaya, toh purana data use karo.
    const query = `
            UPDATE products
            SET 
                name = COALESCE($1, name),
                description = COALESCE($2, description),
                price = COALESCE($3, price),
                stock_quantity = COALESCE($4, stock_quantity)
            WHERE id = $5
            RETURNING *;
        `;
    // Undefined values ko null treat kiya jayega agar woh body mein nahi aaye.
    const values = [name, description, price, stock_quantity, id];

    const result = await dbClient.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found for update." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`Error updating product ID ${id}:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 5. DELETE Product (DELETE /api/products/:id)
app.delete("/api/products/:id", protect, async (req, res) => {
  const { id } = req.params;

  try {
    const query = "DELETE FROM products WHERE id = $1 RETURNING id;";
    const result = await dbClient.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found for deletion." });
    }

    // 204 Status: Deletion successful, but no content to send back
    res.status(200).json({ message: "Product deleted successfully", id });
  } catch (error) {
    console.error(`Error deleting product ID ${id}:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* -------------------------------------------------------------------------- */
/* USER AUTHENTICATION API ROUTES                                             */
/* -------------------------------------------------------------------------- */

// 1. SIGN UP (User Registration)
app.post("/api/auth/signup", async (req, res) => {
  const { first_name, email, password } = req.body;

  // Validation Check
  if (!first_name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Please provide name, email, and password." });
  }

  try {
    // Step 1: Check if user already exists
    const userCheck = await dbClient.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (userCheck.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "User with this email already exists." }); // 409: Conflict
    }

    // Step 2: Password Hashing (The security step)
    const saltRounds = 10; // Kitni baar hashing karni hai. 10 is standard.
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Step 3: User ko database mein save karna
    const query = `
            INSERT INTO users (first_name, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id, first_name, email, created_at; 
        `;
    //⚠️ Hashed password ko return nahi karna
    const values = [first_name, email, password_hash];

    const result = await dbClient.query(query, values);

    res.status(201).json({
      message: "User registered successfully!",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Signup Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// server/index.js (Continuation)

// 2. LOGIN (User Authentication)
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    // Step 1: User ko email se find karna
    const userResult = await dbClient.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    const user = userResult.rows[0];

    if (!user) {
      // Agar user nahi mila, toh 401 Unauthorised return karo
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Step 2: Password Match karna (Decrypting the hash)
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      // Agar password match nahi hua, toh 401 Unauthorised return karo
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Step 3: JWT Token Generate karna
    const token = jwt.sign(
      { id: user.id, email: user.email }, // Payload: Token mein kya data store karna hai
      process.env.JWT_SECRET, // Secret Key
      { expiresIn: "1d" } // Token kitne time ke liye valid rahega (1 day)
    );

    // Step 4: Token aur basic user info client ko bhejna
    res.status(200).json({
      message: "Login successful!",
      token: token,
      user: { id: user.id, first_name: user.first_name, email: user.email },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* -------------------------------------------------------------------------- */
/* SHOPPING CART API ROUTES                                                   */
/* -------------------------------------------------------------------------- */

// 1. GET /api/cart: User ka Cart Aur Items Fetch Karna
app.get("/api/cart", protect, async (req, res) => {
  // req.user mein user ID hai (middleware se aaya)
  const userId = req.user.id;

  try {
    // Step 1: User ka active cart find karna
    const cartResult = await dbClient.query(
      "SELECT id FROM carts WHERE user_id = $1",
      [userId]
    );

    if (cartResult.rows.length === 0) {
      // Agar cart exist nahi karta, toh empty cart return karo
      return res.status(200).json({ cart: { user_id: userId, items: [] } });
    }

    const cartId = cartResult.rows[0].id;

    // Step 2: Cart items aur unki product details fetch karna
    const itemsQuery = `
            SELECT 
                ci.id as item_id, ci.quantity, 
                p.id as product_id, p.name, p.price
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = $1;
        `;
    const itemsResult = await dbClient.query(itemsQuery, [cartId]);

    res.status(200).json({
      cart: {
        id: cartId,
        user_id: userId,
        items: itemsResult.rows,
      },
    });
  } catch (error) {
    console.error("Error fetching cart:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 2. POST /api/cart/items: Cart mein item add/update karna
app.post("/api/cart/items", protect, async (req, res) => {
  const userId = req.user.id;
  const { product_id, quantity } = req.body;

  if (!product_id || !quantity || quantity <= 0) {
    return res
      .status(400)
      .json({ error: "Valid product ID and quantity are required." });
  }

  // Ek single database transaction shuru karte hain
  // Transactions zaroori hain taki agar beech mein koi step fail ho toh poora operation revert ho jaye (yaani half-updated cart na ho)
  try {
    await dbClient.query("BEGIN");

    // 1. User ka Cart ID find/create karna
    let cartResult = await dbClient.query(
      "SELECT id FROM carts WHERE user_id = $1",
      [userId]
    );
    let cartId;

    if (cartResult.rows.length === 0) {
      // Agar cart nahi mila, toh naya banao
      const newCart = await dbClient.query(
        "INSERT INTO carts (user_id) VALUES ($1) RETURNING id",
        [userId]
      );
      cartId = newCart.rows[0].id;
    } else {
      cartId = cartResult.rows[0].id;
    }

    // 2. Item ko Cart_Items table mein insert ya update karna (Upsert logic)
    // ON CONFLICT clause PostgreSQL ka feature hai jisse hume check karne ki zarurat nahi padti
    const upsertQuery = `
            INSERT INTO cart_items (cart_id, product_id, quantity)
            VALUES ($1, $2, $3)
            ON CONFLICT (cart_id, product_id)
            DO UPDATE SET quantity = cart_items.quantity + $3
            RETURNING *;
        `;
    const itemResult = await dbClient.query(upsertQuery, [
      cartId,
      product_id,
      quantity,
    ]);

    // 3. Cart ki updated_at timestamp update karna
    await dbClient.query(
      "UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [cartId]
    );

    await dbClient.query("COMMIT"); // Agar sab theek hai toh changes save karo

    res.status(200).json({
      message: "Item added/updated in cart successfully.",
      item: itemResult.rows[0],
    });
  } catch (error) {
    await dbClient.query("ROLLBACK"); // Agar koi error aaya toh sab kuch revert karo
    console.error("Error adding/updating item in cart:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 3. DELETE /api/cart/items/:product_id: Item ko Cart se remove karna
app.delete("/api/cart/items/:product_id", protect, async (req, res) => {
  const userId = req.user.id;
  const { product_id } = req.params;

  try {
    // Step 1: User ka Cart ID find karna
    const cartResult = await dbClient.query(
      "SELECT id FROM carts WHERE user_id = $1",
      [userId]
    );

    if (cartResult.rows.length === 0) {
      // Agar cart hi nahi hai, toh item delete nahi ho sakta
      return res.status(404).json({ error: "Cart not found." });
    }

    const cartId = cartResult.rows[0].id;

    // Step 2: Cart_Items table se item delete karna
    const deleteQuery = `
            DELETE FROM cart_items 
            WHERE cart_id = $1 AND product_id = $2
            RETURNING id;
        `;
    const deleteResult = await dbClient.query(deleteQuery, [
      cartId,
      product_id,
    ]);

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ error: "Item not found in cart." });
    }

    // 204 Status: Deletion successful, no content to send back
    res.status(204).send();
  } catch (error) {
    console.error("Error removing item from cart:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 4. PUT /api/cart/items/:product_id: Item ki quantity set karna
app.put("/api/cart/items/:product_id", protect, async (req, res) => {
  const userId = req.user.id;
  const { product_id } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    return res
      .status(400)
      .json({ error: "Valid positive quantity is required." });
  }

  try {
    // Step 1: User ka Cart ID find karna
    const cartResult = await dbClient.query(
      "SELECT id FROM carts WHERE user_id = $1",
      [userId]
    );

    if (cartResult.rows.length === 0) {
      // Cart agar exist na kare toh usse create karna
      const newCart = await dbClient.query(
        "INSERT INTO carts (user_id) VALUES ($1) RETURNING id",
        [userId]
      );
      cartId = newCart.rows[0].id;
    } else {
      cartId = cartResult.rows[0].id;
    }

    // Step 2: Quantity update karna
    const updateQuery = `
            UPDATE cart_items
            SET quantity = $3
            WHERE cart_id = $1 AND product_id = $2
            RETURNING *;
        `;
    const updateResult = await dbClient.query(updateQuery, [
      cartId,
      product_id,
      quantity,
    ]);

    if (updateResult.rows.length === 0) {
      // Agar item update nahi hua, toh woh cart mein exist nahi karta
      return res.status(404).json({ error: "Item not found in cart." });
    }

    res.status(200).json({
      message: "Quantity updated successfully.",
      item: updateResult.rows[0],
    });
  } catch (error) {
    console.error("Error updating item quantity:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* -------------------------------------------------------------------------- */
/* ORDERS API ROUTES                                                          */
/* -------------------------------------------------------------------------- */

// POST /api/orders: Order Place Karna (Cart se Order Banana)
app.post("/api/orders", protect, async (req, res) => {
  const userId = req.user.id;
  let totalAmount = 0;

  // Transaction Shuru!
  try {
    await dbClient.query("BEGIN");

    // 1. User ka Cart aur Items fetch karna
    const cartResult = await dbClient.query(
      "SELECT id FROM carts WHERE user_id = $1",
      [userId]
    );

    if (cartResult.rows.length === 0) {
      await dbClient.query("ROLLBACK");
      return res
        .status(400)
        .json({ error: "Cannot place order: Cart is empty." });
    }

    const cartId = cartResult.rows[0].id;

    const itemsQuery = `
            SELECT ci.product_id, ci.quantity, p.price, p.stock_quantity, p.name
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = $1;
        `;
    const cartItems = (await dbClient.query(itemsQuery, [cartId])).rows;

    if (cartItems.length === 0) {
      await dbClient.query("ROLLBACK");
      return res
        .status(400)
        .json({ error: "Cannot place order: Cart is empty." });
    }

    // 2. Stock check aur Total Amount calculate karna
    for (const item of cartItems) {
      if (item.quantity > item.stock_quantity) {
        await dbClient.query("ROLLBACK");
        return res.status(400).json({
          error: `Insufficient stock for product: ${item.name}. Available: ${item.stock_quantity}`,
        });
      }
      totalAmount += parseFloat(item.price) * item.quantity;
    }

    // 3. Orders table mein entry banana
    const orderQuery = `
            INSERT INTO orders (user_id, total_amount, status)
            VALUES ($1, $2, 'Processing')
            RETURNING id, total_amount, status, order_date;
        `;
    const orderResult = await dbClient.query(orderQuery, [userId, totalAmount]);
    const orderId = orderResult.rows[0].id;

    // 4. Order_Items mein Cart Items copy karna aur Stock update karna
    for (const item of cartItems) {
      // a) Order_Items mein item dalna
      const itemInsertQuery = `
                INSERT INTO order_items (order_id, product_id, quantity, price_at_order)
                VALUES ($1, $2, $3, $4);
            `;
      await dbClient.query(itemInsertQuery, [
        orderId,
        item.product_id,
        item.quantity,
        item.price,
      ]);

      // b) Stock se quantity minus karna
      const stockUpdateQuery = `
                UPDATE products
                SET stock_quantity = stock_quantity - $1
                WHERE id = $2;
            `;
      await dbClient.query(stockUpdateQuery, [item.quantity, item.product_id]);
    }

    // 5. Cart aur Cart_Items ko delete karna (Cart clear karna)
    await dbClient.query("DELETE FROM carts WHERE id = $1", [cartId]);

    await dbClient.query("COMMIT"); // Transaction Successful!

    res.status(201).json({
      message: "Order placed successfully!",
      order: orderResult.rows[0],
      items_count: cartItems.length,
    });
  } catch (error) {
    await dbClient.query("ROLLBACK"); // Error aaya toh sab changes revert
    console.error("Error placing order:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// server/index.js (ORDERS API ROUTES section ke neeche add karein)

// GET /api/orders: User ke saare orders fetch karna (SECURED)
app.get("/api/orders", protect, async (req, res) => {
  const userId = req.user.id;

  try {
    const ordersQuery = `
            SELECT id, total_amount, status, order_date 
            FROM orders 
            WHERE user_id = $1 
            ORDER BY order_date DESC;
        `;
    const orders = (await dbClient.query(ordersQuery, [userId])).rows;

    // Agar koi orders nahi hain, toh empty array bhejo
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* -------------------------------------------------------------------------- */
/* END OF API ROUTES                                                          */
/* -------------------------------------------------------------------------- */
