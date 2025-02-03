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

const products = async (req, res) => {
    await ctrlProduct.getProducts(req, res);
    res.render("products", { user: req.session.user || "", products: req.session.products || [] });
}


module.exports = {
    _PUBLIC: {home, about, products},
    _KEEPER: {login, signup},
    _ADMIN: {},
}