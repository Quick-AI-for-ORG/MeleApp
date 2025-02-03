const Product = require('../Models/Product');

const addProduct = async (req, res) => {}
const removeProduct = async (req, res) => {}
const updateProduct = async (req, res) => {}
const getProduct = async (req, res) => {}
const getProducts = async (req, res) => {
    const result = await Product.getAll();
    req.session.products = result.data || [];
    return result.toJSON();
}
const purchaseProduct = async (req, res) => {}

module.exports = {
    addProduct,
    removeProduct,
    updateProduct,
    getProduct,
    getProducts,
    purchaseProduct
}