const Product = require('../Models/Product');
const Result = require("../../Shared/Result");

const jsonToObject = (json) => {
    return new Product(json)
}
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
        const product = jsonToObject(productJSON);
        const result = await product.create();
        return res.json(result.toJSON());
    } catch (error) {
        return res.json(new Result(-1, null, `Error creating product: ${error.message}`).toJSON());
    }
}

const removeProduct = async (req, res) => {
    try {
        const result = await Product.remove(req.body.name);
        return res.json(result.toJSON());
    } catch (error) {
        return res.json(new Result(-1, null, `Error deleting product: ${error.message}`).toJSON());
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
        return res.json(result.toJSON());
    } catch (error) {
        return res.json(new Result(-1, null, `Error updating product: ${error.message}`).toJSON());
    }
}

const getProduct = async (req, res) => {
    try {
        const result = await Product.get(req.body.name);
        req.session.productDetails = result.data || {};
        return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error fetching product: ${error.message}`).toJSON();
    }
}

const getProducts = async (req, res) => {
    try {
        const result = await Product.getAll();
        req.session.products = result.data || [];
        return result.toJSON()
    } catch (error) {
        return new Result(-1, null, `Error fetching products: ${error.message}`).toJSON();
    }
}



module.exports = {
    _jsonToObject: jsonToObject,
    addProduct,
    removeProduct,
    updateProduct,
    getProduct,
    getProducts,
}