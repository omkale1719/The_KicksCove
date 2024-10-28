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
const MongoStore = require("connect-mongo");
require("dotenv").config(); // Load environment variables

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
    secret: "your_secret_key", // replace with a secure secret
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI })
  })
);

// Connect to MongoDB database
async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Connection successful");
  } catch (err) {
    console.log("Connection error", err);
  }
}
main();

// Routes to render different product listings and detail pages

// Show all listings
app.get("/", async (req, res) => {
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
// (remaining cart and wishlist routes)

// Start server on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
