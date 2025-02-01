const express = require("express");
const router = express.Router();
const Product = require("../Models/Product"); // You'll need to create this model

router.get("/", (req, res) => {
  res.render("mele", {
    user: req.session.user === undefined ? "" : req.session.user,
  });
});
router.get("/aboutus", (req, res) => {
  res.render("aboutUs", {
    user: req.session.user === undefined ? "" : req.session.user,
  });
});
router.get("/products", async (req, res) => {
  try {
    const products = [
      {
        title: "Citrus Blossom Honey",
        description: "Sweet honey from Egyptian orange groves",
        price: 12.99,
        size: "500g",
        category: "citrus",
        image: "/Images/bianca-ackermann-ZHOmQ_0X6QQ-unsplash.jpg",
      },
      {
        title: "Wild Flower Honey",
        description: "Pure honey from Nile Valley flowers",
        price: 14.99,
        size: "500g",
        category: "wildflower",
        image: "/Images/bianca-ackermann-nsPPKwXxG8s-unsplash.jpg",
      },
    ];

    res.render("products", {
      user: req.session.user || "",
      products: products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading products");
  }
});

module.exports = router;
