const ctrlApiary = require("../Controllers/ctrlApiary");
const ctrlHive = require("../Controllers/ctrlHive");
const ctrlSensor = require("../Controllers/ctrlSensor");
const ctrlProduct = require("../Controllers/ctrlProduct");
const ctrlUser = require("../Controllers/ctrlUser");
const ctrlKeeper = require("../Controllers/ctrlKeeper");

const home = async (req, res) => {
  res.render("mele", { user: req.session.user || "" });
};

const about = async (req, res) => {
  await ctrlSensor.getSensors(req, res);
  res.render("aboutUs", {
    user: req.session.user || "",
    sensors: req.session.sensors || [],
  });
};

const login = async (req, res) => {
  let message = req.session.message === undefined ? null : req.session.message;
  req.session.message = undefined;
  res.render("login", { layout: false, message: message });
};

const signup = async (req, res) => {
  let message = req.session.message === undefined ? null : req.session.message;
  req.session.message = undefined;
  res.render("signup", { layout: false, message: message });
};
const noLogin = (req, res) => {
  req.session.message = "Please login to access this page";
  res.redirect("/login");
};
const products = async (req, res) => {
  req.session.productDetails = undefined;
  await ctrlProduct.getProducts(req, res);
  res.render("products", {
    user: req.session.user || "",
    products: req.session.products || [],
  });
};

const product = async (req, res) => {
  if (req.body.name) await ctrlProduct.getProduct(req, res);
  if (!req.session.productDetails) res.redirect("/products");
  res.render("product", {
    user: req.session.user || "",
    product: req.session.productDetails || {},
  });
};

const dashboard = async (req, res) => {
  let message = req.session.message === undefined ? null : req.session.message;
  await ctrlUser.getApiaries(req, res);
  await ctrlUser.getKeepers(req, res);
  for (let [i, apiary] of req.session.user.apiaries.entries()) {
    req.body._id = apiary._id;
    let result = await ctrlApiary.getApiaryHives(req, res);
    if (result.success.status) {
      apiary.hives = result.data || [];
      req.session.user.apiaries[i] = apiary;
      req.session.user.apiaries.hives = apiary.hives;
    }
  }
  req.session.message = undefined;
  res.render("beekeeper", {
    layout: false,
    message: message,
    user: req.session.user || "",
    apiaries: req.session.user.apiaries || [],
    keepers: req.session.user.keepers || [],
    hives: req.session.user.apiaries.hives || [],
  });
};

const profile = (req, res) => {
  let message = req.session.message === undefined ? null : req.session.message;
  req.session.message = undefined;
  res.render("profile", {
    layout: false,
    message: message,
    user: req.session.user || "",
  });
};

const notFound = (req, res) => {
  res.render("404", { user: req.session.user || "" });
};

const upgrade = async (req, res) => {
  let message = req.session.message === undefined ? null : req.session.message;
  req.session.message = undefined;
  await ctrlProduct.getProducts(req, res);
  await ctrlUser.getApiaries(req, res);
  res.render("upgrade", {
    user: req.session.user || "",
    layout: false,
    message: message,
    kits: req.session.products || [],
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    apiaries: req.session.user.apiaries || [], // Changed from appiaries to apiaries
  });
};

const postUpgrade = (req, res) => {
  const upgradeData = req.body;
  res.redirect("/keeper/dashboard");
};

module.exports = {
  _PUBLIC: { home, about, products, product, noLogin, notFound },
  _KEEPER: { login, signup, profile, dashboard, upgrade, postUpgrade },
  _ADMIN: {},
};
