const mongoose = require('mongoose');
const Product = require('../models/Products.js');
const FKHelper = require('../mongoMiddlewares/preventDeleteFK');
let Schema = mongoose.Schema;

let typeSchema = new Schema({
    name: {
        type: String,
        required: [true, "El nombre del tipo es requerido"],
    },
    description: String,
    status: {
        type: Boolean,
        default: true
    },
    userId: {
        type: String,
        required: true
    },

}, {
    timestamps: true
});

// typeSchema.pre('findOneAndRemove', async () => {
//     console.log("123 brus");
//     console.log("este es this:", this);
//     console.log('query criteria', this.getFilter()); // { _id: 5bc8d61f28c8fc16a7ce9338 }
//     console.log(this._update); // { '$set': { name: 'I was updated!' } }
//     console.log(this._conditions);
//     await FKHelper(Product, this.getQuery());
// });

module.exports = mongoose.model('Types', typeSchema);