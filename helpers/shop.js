const Product = require('../models/product');

async function getProductTitle(productId){
    const res = await Product.findById(productId).then(prod => {
        return prod;
    })
    .catch(err => console.log(err));
    return res;
}

// function getProductTitle(productId){
//     Product.findById(productId).then(prod => {
//         return prod.title;
//     })
//     .catch(err => console.log(err));
// }

exports.getProductTitle = getProductTitle;
