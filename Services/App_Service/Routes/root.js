const express = require("express");
const router = express.Router();
const ctrlPages = require("../Controllers/ctrlPages");

router.get("/", ctrlPages._PUBLIC.home);
router.get("/aboutus", ctrlPages._PUBLIC.about);

router.get("/products", async (req, res) => {
  try {
    const products = [
      {
        _id: "1",
        title: "Citrus Blossom Honey",
        description: "Sweet honey from Egyptian orange groves",
        price: 12.99,
        size: "500g",
        category: "citrus",
        image: "/Images/bianca-ackermann-ZHOmQ_0X6QQ-unsplash.jpg",
      },
      {
        _id: "2",
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

router.get("/products/:id", async (req, res) => {
  try {
    // Mock data - replace with database query later
    const products = {
      1: {
        title: "Citrus Blossom Honey",
        description:
          "Sweet honey from Egyptian orange groves, carefully harvested to preserve its natural flavors and therapeutic properties. Our citrus honey offers a delicate balance of sweetness with subtle citrus undertones.",
        price: 12.99,
        size: "500g",
        category: "citrus",
        image: "/Images/bianca-ackermann-ZHOmQ_0X6QQ-unsplash.jpg",
        features: [
          "100% Pure Egyptian Honey",
          "Natural Citrus Undertones",
          "No Artificial Additives",
          "Lab Tested Quality",
        ],
      },
      2: {
        // ...similar structure for other products
      },
    };

    const product = products[req.params.id];
    if (!product) {
      return res.status(404).send("Product not found");
    }

    res.render("product", {
      user: req.session.user || "",
      product: product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading product");
  }
});

module.exports = router;
