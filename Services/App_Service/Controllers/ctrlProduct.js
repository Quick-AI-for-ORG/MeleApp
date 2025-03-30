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
        const name = req.body.name || req.query.name;
        const result = await Product.remove(name);
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
        const by = req.body.name == undefined ? "_id" : "name"
        const result = await Product.get(req.body.name == undefined ? req.body._id : req.body.name, by);
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

const getSortedProducts = async (req, res) => {
    try {
        const sortBy = req.body.sortBy || { createdAt: -1 };
        const limit = req.body.limit || 10;
        const result = await Product.getAll(sortBy, limit);
        req.session.products = result.data || [];
        return result.toJSON()
    } catch (error) {
        return new Result(-1, null, `Error fetching products: ${error.message}`).toJSON();
    }
}

const getProductsCount = async (req, res) => {
    try {
        const result = await Product.count();
        req.session.stats.products = result.data || 0
        return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error fetching product count: ${error.message}`).toJSON();
    }
}


module.exports = {
    _jsonToObject: jsonToObject,
    addProduct,
    removeProduct,
    updateProduct,
    getProduct,
    getProducts,
    getSortedProducts,
    getProductsCount
}