//core node modules 
const path = require('path');

//gets the folder that contains the app.js file
module.exports = path.dirname(process.mainModule.filename);//process.mainModule.filename = the app.js file