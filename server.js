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

var PORT = 8080;

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
mongoose.connect("mongodb://localhost/week18Populater", {
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
                    res.send("scrape done");
                })
                .catch(function(err) {
                    res.json(err);
                });
        });
    });
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

//route for saving/updating an Articles associated Comment
app.post("/articles/:id", function(req, res) {
    db.Comment
        .create(req.body)
        .then(function(data) {
            return db.Article.findOneAndUpdate({ "_id": req.params.id }, { $push: { notes: data._id } }, { new: true });
        });
    res.send("done");
    //TODO
    //save the new comment that gets to the Comments collection
    //then find an article from req.params.id
    //and update its "comment" property with the _id of the new comment
});

//start the server
app.listen(PORT, function() {
    console.log("App is running on port " + PORT);

});