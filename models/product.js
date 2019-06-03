const products = [];
const fs = require('fs');

module.exports = class Product {
    
    constructor(title){
        this.title = title;
    }

    save(){
        products.push(this);
    }

    static fetchAll(){
        return products;
    }

}