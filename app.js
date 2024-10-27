// Importing essential modules
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./model/listing.js");
const Sale = require("./model/sale.js");
const New_A = require("./model/na.js");
const Men = require("./model/men.js");
const Women = require("./model/women.js");
const Collections = require("./model/collections.js");
const Kids = require("./model/kids.js");
const path = require("path");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const Wishlist = require("./model/wishlist.js");

// Setting up EJS as the view engine and configuring view file paths
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
app.engine("ejs", ejsMate);

// Parsing incoming JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session management setup to handle user sessions, cookies, etc.
app.use(
  session({
    secret: "your_secret_key", // Should be stored securely in production
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Connect to MongoDB database
async function main() {
  try {
    await mongoose.connect("mongodb+srv://<username>:<password>@cluster.mongodb.net/shoes_palace?retryWrites=true&w=majority");

    console.log("Connection successful");
  } catch (err) {
    console.log("Connection error", err);
  }
}
main();




// Routes to render different product listings and detail pages

// Show all listings
app.get("/showall", async (req, res) => {
  const allListing = await Listing.find({});
  res.render("./listings/showall.ejs", { allListing });
});

// Show details for individual listing
app.get("/showdetail/:id", async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("./listings/showdetail.ejs", { listing });
});

// Show all sale items
app.get("/salepage", async (req, res) => {
  const allListing = await Sale.find({});
  res.render("./listings/sale_showall.ejs", { allListing });
});

// Show details for individual sale item
app.get("/sale_showdetail/:id", async (req, res) => {
  const { id } = req.params;
  const listing = await Sale.findById(id);
  res.render("./listings/sale_showdetail.ejs", { listing });
});

// Routes for other product categories (arrival, men, women, kids, collections)
app.get("/arivalpage", async (req, res) => {
  const allListing = await New_A.find({});
  res.render("./listings/new_A_showall.ejs", { allListing });
});
app.get("/new_A_showdetail/:id", async (req, res) => {
  const { id } = req.params;
  const listing = await New_A.findById(id);
  res.render("./listings/new_A_showdetail.ejs", { listing });
});
app.get("/men", async (req, res) => {
  const allListing = await Men.find({});
  res.render("./listings/men.ejs", { allListing });
});
app.get("/men_d/:id", async (req, res) => {
  const { id } = req.params;
  const listing = await Men.findById(id);
  res.render("./listings/men_d.ejs", { listing });
});
app.get("/women", async (req, res) => {
  const allListing = await Women.find({});
  res.render("./listings/women.ejs", { allListing });
});
app.get("/women_d/:id", async (req, res) => {
  const { id } = req.params;
  const listing = await Women.findById(id);
  res.render("./listings/women_d.ejs", { listing });
});
app.get("/kids", async (req, res) => {
  const allListing = await Kids.find({});
  res.render("./listings/kids.ejs", { allListing });
});
app.get("/kids_d/:id", async (req, res) => {
  const { id } = req.params;
  const listing = await Kids.findById(id);
  res.render("./listings/kids_d.ejs", { listing });
});
app.get("/collections", async (req, res) => {
  const allListing = await Collections.find({});
  res.render("./listings/collections.ejs", { allListing });
});
app.get("/collections_d/:id", async (req, res) => {
  const { id } = req.params;
  const listing = await Collections.findById(id);
  res.render("./listings/collections_d.ejs", { listing });
});

// Mapping of models for easier retrieval by category
const models = { Sale, Listing, New_A, Men, Women, Kids, Collections };

// Helper function to fetch product by model name and ID
async function getProductById(productModel, productId) {
  try {
    const model = models[productModel];
    if (!model) return null;
    return await model.findById(productId);
  } catch (error) {
    console.error(`Error fetching product by ID: ${error.message}`);
    return null;
  }
}

// Cart management routes

// Add product to cart
app.post("/add-to-cart", async (req, res) => {
  const { productId, quantity, model } = req.body;
  try {
    const product = await getProductById(model, productId);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }
    if (!req.session.cart) {
      req.session.cart = [];
    }
    req.session.cart.push({
      productId: product._id,
      title: product.title,
      price: product.price,
      quantity: quantity,
    });
    console.log("Cart:", req.session.cart);
    return res.json({ success: true, message: "Added to cart" });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.json({ success: false, message: "Error adding to cart" });
  }
});

// Render the cart page
app.get("/cart", (req, res) => {
  res.render("cart", { cart: req.session.cart || [] });
});

// Purchase management routes

// Buy Now functionality (single product purchase)
app.post("/buy-now", async (req, res) => {
  const { productId, quantity, model } = req.body;
  try {
    const product = await getProductById(model, productId);
    if (!product) {
      return res.render("order_sucess.ejs", { message: "Product not found" });
    }
    req.session.order = {
      productId: product._id,
      title: product.title,
      price: product.price,
      quantity: quantity,
    };
    res.json({ success: true });
  } catch (error) {
    console.error("Error processing buy now:", error);
    res.json({ success: false, message: "Error processing order" });
  }
});

// Render the buy now page
app.get("/buy_now1", (req, res) => {
  const buy = req.session.order || [];
  res.render("buy_now.ejs", { buy });
});

// Wishlist management routes

// Add product to wishlist
app.post("/add-to-wishlist", async (req, res) => {
  const { productId, model } = req.body;
  if (!productId || !model) {
    return res.status(400).json({ error: "Product ID or model not provided" });
  }
  try {
    const product = await getProductById(model, productId);
    if (!product) {
      return res.status(500).json({ error: "Product not found" });
    }
    if (!req.session.wishlist) {
      req.session.wishlist = [];
    }
    req.session.wishlist.push(product._id);
    res.redirect(req.get("referer"));
  } catch (err) {
    console.error("Error adding to wishlist:", err);
    res.status(500).json({ error: "Error adding to wishlist" });
  }
});

// Render the wishlist page
app.get("/wishlist", async (req, res) => {
  if (!req.session.wishlist || req.session.wishlist.length === 0) {
    return res.redirect("/Empty_wishlis");
  }
  try {
    const wishlistProducts = [];
    for (let productId of req.session.wishlist) {
      const product =
        (await Listing.findById(productId)) ||
        (await Sale.findById(productId)) ||
        (await New_A.findById(productId)) ||
        (await Men.findById(productId)) ||
        (await Women.findById(productId)) ||
        (await Collections.findById(productId)) ||
        (await Kids.findById(productId));
      if (product) {
        wishlistProducts.push(product);
      }
    }
    res.render("wishlist.ejs", { wishlist: wishlistProducts });
  } catch (err) {
    console.error("Error fetching wishlist:", err);
    res.status(500).json({ error: "Error fetching wishlist" });
  }
});

// Render empty wishlist page
app.get("/Empty_wishlis", (req, res) => {
  res.render("Empty_wishlist.ejs");
});

// Remove a product from wishlist
app.post("/remove-from-wishlist", async (req, res) => {
  const { productId } = req.body;
  try {
    if (!req.session.wishlist) {
      return res.redirect("/wishlist");
    }
    req.session.wishlist = req.session.wishlist.filter((id) => id !== productId);
    res.redirect("/wishlist");
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.redirect("/wishlist");
  }
});

// Footer links pages (Privacy, Terms, etc.)
app.get("/privacy", (req, res) => {
  res.render("./footer_links/privacy.ejs");
});
app.get("/terms", (req, res) => {
  res.render("./footer_links/term.ejs");
});
app.get("/track_orders", (req, res) => {
  res.render("track_order.ejs");
});
app.get("/Contact_Us", (req, res) => {
  res.render("./footer_links/contact.ejs");
});

// Start server on port 3000
// process.env.PORT, () => {
//   console.log("Server running on port 3000");
// });



module.exports = app;
