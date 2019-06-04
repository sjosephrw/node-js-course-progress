//const products = [];
const fs = require('fs');
const path = require('path');

const rootDir = require('../util/path');
const p = path.join(rootDir, 'data', 'products.json');


const getProductsFromFile = (cb) => {

    fs.readFile(p, (err, fileContent) => {
        console.log(err);

        if (err){//if the products.json file exists
            return cb([]);
        } else {
            return cb(JSON.parse(fileContent));
        }

    }); 
}

module.exports = class Product {
    
    constructor(title){
        this.title = title;
    }

    save(){

        getProductsFromFile((products) => {
            products.push(this);//then  push the newly created product into this array.
        
            fs.writeFile(p, JSON.stringify(products), (err) => {
                console.log(err);
            }); 
        });

        fs.readFile(p, (err, fileContent) => {
            console.log(err);        
        });
    }

    static fetchAll(cb){

        getProductsFromFile(cb);

    }

}