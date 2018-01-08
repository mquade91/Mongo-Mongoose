var mongoose = require('mongoose');

//reference to the schema
var Schema = mongoose.Schema;

//schema constructor
var ArticleSchema = new Schema({
    //title of article *required
    title: {
        type: String,
        required: true
    },
    //link of the article
    link: {
        type: String,
        required: true
    },
    //'comment is an object that stores a Comment id'
    //ref property links Objectid to Comment model
    //allows us to populate the Article w/ associated Comment
    comments: [{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }],
    saved: {
        type: Boolean,
        default: false
    }

});

//creates model from schema above, mongoose model method
var Article = mongoose.model("Article", ArticleSchema);

//export Article model
module.exports = Article;
