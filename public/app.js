//Grab articles as JSON
$.getJSON('/articles', function(data) {
    //for each one that comes back
    for (var i = 0; i < data.length; i++) {
        //display Articles on the page
        $('#articles').append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
    }
});

//button to scrape
$(document).on('click', '#scrapeButton', function() {
    $.ajax({
        method: "GET",
        url: "/scrape"
    }).done(function(data) {
        console.log(data);
    });
});

//when you click a <p>
$(document).on('click', 'p', function() {
    //empty comments from comment section

    $("#comments").empty();
    //save the id from the <p>
    var thisId = $(this).attr("data-id");

    //now make an AJAX call for the Article
    $.ajax({
            method: "GET",
            url: "/articles/" + thisId
        })
        .done(function(data) {

            //title of the article
            $("#comments").append("<h2>" + data[0].title + "<h2>");
            //input for new title
            $("#comments").append("<input id='titleinput' name='title' >");
            //text area to add a new body
            $("#comments").append("<textarea id='bodyinput' name='body'></textarea>");
            //button to submit the comments, w/ the ID of the Article saved to it
            $("#comments").append("<button data-id='" + data[0]._id + "'id='savecomment'> Save Comment </button>");

            //if there's a comment with the Article
            if (data[0].comments) {
                //place title of comment in title input
                $('#titleinput').val(data[0].comments.title);
                //place body for the comment in the body text area
                $('#bodyinput').val(data[0].comments.body);
            }
        });
});

//when you click 'Save Comment' button
$(document).on("click", "#savecomment", function() {

    var thisId = $(this).attr("data-id");

    //run a POST request to change the comment
    $.ajax({
            method: "POST",
            url: "/articles/" + thisId,
            data: {
                //value from title input
                title: $("#titleinput").val(),
                //same for body
                body: $("#bodyinput").val()
            }
        })
        .done(function(data) {
            console.log(data);
            $("#comments").empty();
        });
    //remove values from text areas
    $("#titleinput").val("");
    $("#bodyinput").val("");
});


// When user clicks the weight sort button, display table sorted by weight
$("#get-saved").on("click", function() {
    $("#saved").empty();
    // Do an api call to the back end for json with all ARTICLES that have
    //been SAVED
    $.ajax({
            method: "GET",
            url: "/saved"
        })
        .done(function(data) {
            console.log("you clicked save");
            console.log(data);
            for (let i = 0; i < data.length; i++) {
                // //title of the article
                $("#saved").append("<h2>Saved Articles</h2><br>" + "<p>Title: " + data[0].title + "<p>");
                // comments
                $("#saved").append("<p>Comments: " + "Title: " + JSON.stringify(data[0].comments[0].title) + "Body: " + JSON.stringify(data[0].comments[0].body) + "</p>");
                // //link
                $("#saved").append("<p>Link: " + data[0].link + "</p>");
                //if article is saved
                $("#saved").append("<p>Saved: " + data[0].saved + "</p><br>---------------------");

            }
        });

});
