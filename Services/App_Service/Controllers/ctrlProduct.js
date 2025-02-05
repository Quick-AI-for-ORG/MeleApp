const Product = require('../Models/Product');
const Result = require("../../Shared/Result");

const addProduct = async (req, res) => {
    try {
        const productJSON = {
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            subscription: req.body.subscription || false,
            images: req.body.images || [],
            counter: req.body.counter || 0
        };
        const product = new Product(productJSON);
        const result = await product.create();
        return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error creating product: ${error.message}`);
    }
}

const removeProduct = async (req, res) => {
    try {
        const result = await Product.remove(req.body.name);
        return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error deleting product: ${error.message}`);
    }
}

const updateProduct = async (req, res) => {
    try {
        let update = {};
        Product.attributes.forEach(attr => {
            if (req.body.hasOwnProperty(attr)) {
                update[attr] = req.body[attr];
            }
        });
        const result = await Product.modify(update);
        return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error updating product: ${error.message}`);
    }
}

const getProduct = async (req, res) => {
    try {
        const result = await Product.get(req.body.name);
        req.session.productDetails = result.data || {};
        return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error fetching product: ${error.message}`);
    }
}

const getProducts = async (req, res) => {
    try {
        const result = await Product.getAll();
        req.session.products = result.data || [];
        return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error fetching products: ${error.message}`);
    }
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