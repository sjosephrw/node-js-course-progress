//core node modules
const http = require('http');

const path = require('path');

//3rd party node modules and my custom modules.
//const routes = require('./routes');
const express = require('express');
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const app = express();

app.use(bodyParser.urlencoded({extended: false}));//necessary for req.body to work, {extended: false} - is necessary other wise the terminal displays a error

app.use('/admin', adminRoutes);//importing the adminRoutes object.

app.use(shopRoutes);//importing the shopRoutes object.


/*
app.use((req, res, next)=>{
    console.log('In the middle ware.');
    next();//if we dont pass next the request wont pass to the next middle ware (the one below this one) it stays in here(if we are not using next() then we have to return a response)
});
*/
/*
app.use('/add-product', (req, res, next)=>{
    res.send('<form action="/product" method="post"><input type="text" name="title"><button type="submit">ADD</button></form>');
});

app.post('/product', (req, res, next)=>{
    console.log(req.body);
    res.redirect('/');
});
*/
//less sepcific middle wares ones that have a route like this '/', like this one, should be put at the end of the file
/*
app.use('/', (req, res, next)=>{
    //res.setHeader('Content-Type', 'text/html');//this is not necessary res.send() from express.js automatically sets the headers, but if you want to overwrite the headers uncomment this line.
    res.send('<h1>Hi from Express.</h1>');
});
*/

app.use('/', (req, res, next)=>{
    //res.setHeader('Content-Type', 'text/html');//this is not necessary res.send() from express.js automatically sets the headers, but if you want to overwrite the headers uncomment this line.
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
    //the setHeader method can also be chained like this - res.status(404).seatHeader('some key', 'some value').send('<h1>Page not found.</h1>');
});

const server = http.createServer(app);

//routes.someKey = 'some value';//we can not attach key value pairs to the routes module from here it has to be done from inside the routes module it self.

server.listen(3000, console.log("Listening on 3000"));