const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejs = require("ejs");
const {check, validationResult} = require("express-validator");

const app = express();

// Middlewares

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: true}));

//connecting to db

mongoose.connect("mongodb://localhost:27017/signUpDetails", {useNewUrlParser: true, useUnifiedTopology: true}).then(()=>{console.log("connected to mongodb")})
.catch((err)=>{console.error("couldnot connect to db", err)})


//reader and publisher schema
const signupDetails = new mongoose.Schema({

    name: {
        type: String,
        required: true   
    }, 
    email: {
        type: String,
        required: true,
        match: /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }

});


const Reader = mongoose.model("Reader", signupDetails);
const Publisher = mongoose.model("Publisher", signupDetails);


//creating function to create a reader and saving it to db
function createReader(req, res) {
    const reader = new Reader();
    reader.name = req.body.name;
    reader.email =  req.body.email; 
    reader.password = req.body.password;

    reader.save();
}


//creating function to create a publisher and saving it to db
function createPublisher(req, res) {
    const publisher = new Publisher();
    publisher.name = req.body.name;
    publisher.email =  req.body.email; 
    publisher.password = req.body.password;

    publisher.save();
}

const PORT = process.env.Port||3000;


//Getting static html file
app.get("/", (req, res) => {

    res.sendFile(path.join(__dirname, "public", "index.html"));

});


//getting reader registeration page
app.get("/reader/login", (req, res)=>{

    res.render("Reader-login");

});


//posting reader data to server
app.post("/reader/login",[

    // check("name", "Name must be 3+ characters long")
    // .exists()
    // .isLength({min: 3}),

    // check("email", "Email is not valid")
    // .isEmail()
    // .normalizeEmail()

    check('name')
    .not()
    .isEmpty()
    .withMessage('Name is required')
    .isLength({min: 3})
    .withMessage("name must 3+ characters long"),
    check('email')
    .not()
    .isEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid Email')
    .custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            Reader.findOne({email:req.body.email}, function(err, reader){
            if(err) {
                reject(new Error('Server Error'))
            }
            if(Boolean(reader)) {
                reject(new Error('E-mail already in use'))
            }
             resolve(true)
            });
         });
    }),
          // Check Password
    check('password')
    .not()
    .isEmpty()
    .withMessage('Password is required')

] , (req, res)=>{

    const error = validationResult(req);
    
    if(!error.isEmpty()){
        const alert = error.array();
        res.render("Reader-login", {alert});
    }
    else{
        createReader(req, res);
        res.send("data loaded successfully");
    }
    
});


//signing the registered readers
app.post("/reader/signin", [
    
    check('email')
    .not()
    .isEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid Email')
    .custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            Reader.findOne({email:req.body.email}, function(err, reader){
            if(err) {
                reject(new Error('Server Error'))
            }
            if(!Boolean(reader)) {
                reject(new Error('E-mail doesnot exist'))
            }
             resolve(true)
            });
         });
    }),
    check('password')
    .not()
    .isEmpty()
    .withMessage('Password is required')
    .custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            Reader.findOne({email: req.body.email}, function(err, reader) {
                if(err) {
                    reject(new Error('Server Error'));
                }
                if(!(req.body.password == reader.password)){
                    reject(new Error('Password is wrong'));    
                }
                resolve(true);
            });
        })
    })
], (req, res)=> {

    const error = validationResult(req);

    if(!error.isEmpty()){
        const alert1 = error.array();
        res.render("Reader-login", {alert1});
    }
    else{

        Reader.findOne({email: req.body.email}, function(err, reader){
            
            res.redirect("/reader/user/" + reader.name);

        });
    }
    
});


app.get("/reader/user/:name", (req, res) => {

    res.send("hello " + req.params.name);

});



//getting publisher login page
app.get("/publisher/login", (req, res)=>{

    res.render("publisher-login");

});


//posting publishers data to server
app.post("/publisher/login",[

    check('name')
    .not()
    .isEmpty()
    .withMessage('Name is required')
    .isLength({min: 3})
    .withMessage("name must 3+ characters long"),
    check('email')
    .not()
    .isEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid Email')
    .custom((value, {req}) => {
      return new Promise((resolve, reject) => {
        Publisher.findOne({email:req.body.email}, function(err, publisher){
          if(err) {
            reject(new Error('Server Error'))
          }
          if(Boolean(publisher)) {
            reject(new Error('E-mail already in use'))
          }
          resolve(true)
        });
      });
    }),
    // Check Password
    check('password')
    .not()
    .isEmpty()
    .withMessage('Password is required')

] ,(req, res)=>{

    const error = validationResult(req);

    if(!error.isEmpty()){
        const alert = error.array();
        res.render("publisher-login", {alert});
    }
    
    else{
        createPublisher(req, res);
        res.send("data loaded successfully");
    }
    
});

//signing the registered publisher
app.post("/publisher/signin", [
    
    check('email')
    .not()
    .isEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid Email')
    .custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            Publisher.findOne({email:req.body.email}, function(err, publisher){
            if(err) {
                reject(new Error('Server Error'))
            }
            if(!Boolean(publisher)) {
                reject(new Error('E-mail doesnot exist'))
            }
             resolve(true)
            });
         });
    }),
    check('password')
    .not()
    .isEmpty()
    .withMessage('Password is required')
    .custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            Publisher.findOne({email: req.body.email}, function(err, publisher) {
                if(err) {
                    reject(new Error('Server Error'));
                }
                if(!(req.body.password == publisher.password)){
                    reject(new Error('Password is wrong'));    
                }
                resolve(true);
            });
        })
    })
], (req, res)=> {

    const error = validationResult(req);

    if(!error.isEmpty()){
        const alert1 = error.array();
        res.render("publisher-login", {alert1});
    }
    else{

        res.send("data loaded successfully");
    }
    
});


app.listen(PORT,()=>{console.log("listening to Port 3000")});