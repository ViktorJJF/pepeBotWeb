const OrderDetail = require('../models/OrderDetails.js');
const Product = require('../models/Products.js');

const updateStock = (productId, qty) => {
    return new Promise((resolve, reject) => {
        Product.findOne({
            _id: productId
        }, (err, product) => {
            if (err) {
                return console.log(err);
            }
            product.update({
                    stock: product.stock + qty
                }, ).then(() => {
                    resolve();
                })
                .catch((err) => {
                    console.log(err);
                });
        });
    });
}

module.exports = {
    updateStock
}