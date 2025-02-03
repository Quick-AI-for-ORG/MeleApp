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
    req.session.productDetails = undefined;
    await ctrlProduct.getProducts(req, res);
    res.render("products", { user: req.session.user || "", products: req.session.products || [] });
}


const product =  async (req, res) => {
    if(req.body.productName) await ctrlProduct.getProduct(req, res)
    if(!req.session.productDetails) res.redirect("/products");
      res.render("product", {
        user: req.session.user || "",
        product: req.session.productDetails || {},
      });
  }

const dashboard =  (req, res) => {
  res.render("beekeeper", {
    layout: false,
    message: req.body.message === undefined ? null : req.body.message,
  });
}

const upgrade = async (req, res) => {
    try {
     
    await ctrlProduct.getProducts(req, res);
      res.render("upgrade", {
        user: req.session.user || "",
        layout: false,
        kits: req.session.products || [],
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