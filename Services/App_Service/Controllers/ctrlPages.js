const ctrlApiary = require('../Controllers/ctrlApiary');
const ctrlHive = require('../Controllers/ctrlHive');
const ctrlSensor = require('../Controllers/ctrlSensor');
const ctrlProduct = require('../Controllers/ctrlProduct');
const ctrlUser = require('../Controllers/ctrlUser');

const home = async (req, res) => {
    res.render("mele", { user: req.session.user || "" });
}

const about = async (req, res) => {
    await ctrlSensor.getSensors(req, res);
    res.render("aboutUs", { user: req.session.user || "" ,
        sensors: req.session.sensors || []
    });
}

const login = async (req, res) => {
    let message = req.session.message === undefined ? null : req.session.message;
    req.session.message = undefined;
    res.render("login", { layout: false, message: message });
}

const signup = async (req, res) => {
    let message = req.session.message === undefined ? null : req.session.message;
    req.session.message = undefined;
    res.render("signup", { layout: false, message: message });
}
const noLogin = (req, res) => {
  req.session.message = "Please login to access this page";
  res.redirect("/keeper/login");
}
const products = async (req, res) => {
    await ctrlProduct.getProducts(req, res);
    res.render("products", { user: req.session.user || "", products: req.session.products || [] });
}


const product =  async (req, res) => {
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
      }
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
  }

const dashboard =  (req, res) => {
  res.render("beekeeper", {
    layout: false,
    message: req.body.message === undefined ? null : req.body.message,
  });
}

const upgrade = async (req, res) => {
    try {
      const meleDB = mongoose.connection.useDb("meleDB");
  
      const collections = await meleDB.db.listCollections().toArray();
  
      const kits = await meleDB.db.collection("products").find({}).toArray();
  
      res.render("upgrade", {
        user: req.session.user || "",
        layout: false,
        kits: kits,
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
      });
    } catch (error) {
      console.error("Database Error:", error);
      res.render("upgrade", {
        user: req.session.user || "",
        layout: false,
        kits: [],
      });
    }
  }

const postUpgrade = (req, res) => {
    const upgradeData = req.body;
    res.redirect("/keeper/dashboard");
  }

module.exports = {
    _PUBLIC: {home, about, products,product},
    _KEEPER: {login, signup,noLogin,dashboard,upgrade,postUpgrade},
    _ADMIN: {},
}