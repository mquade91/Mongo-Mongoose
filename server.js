var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

//scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

//requiring all models
var db = require("./models");

var PORT = process.env.PORT || 8080;

//Initializing Express
var app = express();

//using morgan logger for logginf results
app.use(logger("dev"));

//use body-parser for handling submissions
app.use(bodyParser.urlencoded({ extended: false }));

//use express static to server the public folder as static directory
app.use(express.static("public"));

//set ongoose to leverage built in JS ES6 promises
//connect to MongoDB
mongoose.Promise = Promise;
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scrapeApp";
mongoose.connect(MONGODB_URI, {
    useMongoClient: true
});

//routes

// A GET route for scraping the echojs website
app.get("/scrape", function(req, res) {
    //grabbing body of HTML with request
    axios.get("http://www.echojs.com/").then(function(response) {
        //next we load that into cheerio and save it to $ for shorthand selector
        var $ = cheerio.load(response.data);
        //now we grab every h2 within an article tag and do the following
        $("article h2").each(function(i, element) {
            //save an empty result object
            var result = {};

            //add the text and href of every link and save them as properties of the result object

            result.title = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");

            //creat a new Article using the 'result' object built from scraping
            db.Article
                .create(result)
                .then(function(dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function(err) {
                    res.json(err);
                });
        });
        res.redirect("/articles");
    });
    res.send("scrape done");
});

///route for getting all the articles from the db
app.get("/articles", function(req, res) {
    db.Article.find({}, function(error, found) {
        if (error) {
            console.log(error);
        }
        else {
            res.json(found);
        }
    });
});

//route for grabbing a specific Article by id, populate with comment
app.get("/articles/:id", function(req, res) {
    db.Article.find({ "_id": req.params.id })
        .populate('comments')
        .then(function(dataReturned) {
            res.json(dataReturned);
        })
        .catch(function(err) {
            res.json(err);
        });
});


//route to GET SAVED ARTICLES by id, populate with comment
app.get("/saved", function(req, res) {
    db.Article.find({ "saved": true })
        .populate('comments')
        .then(function(savedArticles) {
            res.json(savedArticles);
        })
        .catch(function(err) {
            res.json(err);
        });
});


//route for savingan Articles associated Comment
app.post("/articles/:id", function(req, res) {
    console.log(req.body);
    db.Comment
        .create(req.body)
        .then(function(data) {
            console.log(data);
            return db.Article.findOneAndUpdate({ "_id": req.params.id }, { $push: { comments: data._id } }, { new: true });
        });
    res.send("done");
});


//***NOT WORKING YET******

//code used to update if Article is SAVED or NOT SAVED
// app.post("/articles/:id", function(req, res) {
//     db.Article.findOneAndUpdate({ "_id": req.params.id }, { $set: { saved: true } });
// });




//start the server
app.listen(PORT, function() {
    console.log("App is running on port " + PORT);

});
