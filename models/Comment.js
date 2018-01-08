var mongoose = require("mongoose");

var Schema = mongoose.Schema;

//use Schema constructor to create Comment Model
var CommentSchema = new Schema({
    //title
    title: String,
    //body
    body: String
});


//creates model from above schema
var Comment = mongoose.model('Comment', CommentSchema);
//exporting Comment model
module.exports = Comment;
