
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

const myDatabaseName = "postsDB";
const myTableName = "Post";

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutStartingContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactStartingContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";
let postsArray = [];

const app = express();

const formatDate = (date) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
    return date.toLocaleString('en-GB', options).replace(',', ' at');
};

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));



mongoose.connect("mongodb+srv://shahid-anwaar:qwerty123@cluster0.v3fh1.mongodb.net/" + myDatabaseName + "?retryWrites=true&w=majority&appName=Cluster0");

const postSchema = new mongoose.Schema({
    Title: {
        type: String,
        required: [true, "Please provide a title"],
    },
    Content: {
        type: String,
        required: [true, "Please enter the content of the post."],
    },
    DateCreate: {
        type: String,
        default: () => formatDate(new Date()),
    }
});


const Post = mongoose.model(myTableName, postSchema);


app.get("/", async function (req, res) {
    postsArray = await Post.find();
    res.render("home", { homeContent: homeStartingContent, allPosts: postsArray });
})

app.get("/contact", function (req, res) {
    res.render("contact", { contactContent: contactStartingContent });
})

app.get("/about", function (req, res) {
    res.render("about", { aboutContent: aboutStartingContent });
})

app.get("/compose", function (req, res) {
    res.render("compose");
})

app.get("/post/:topic", async function (req, res) {
    postsArray = await Post.find();
    let myTopic = _.lowerCase(req.params.topic);
    let matchFound = false;
    let loadedPost;

    postsArray.forEach(function (post) {

        let postTitle = _.lowerCase(post.Title);

        if (postTitle === myTopic) {
            console.log("Match found.....");
            matchFound = true;
        }
    })
    if (matchFound) {
        loadedPost = postsArray.find(function (p) { return _.lowerCase(p.Title) === myTopic });
        console.log(loadedPost);

        res.render("post", { topic: _.upperFirst(_.lowerCase(loadedPost.Title)), content: loadedPost.Content, postId: loadedPost._id, DateCreate: loadedPost.DateCreate });
    }
    else {
        console.log("Sorry! Match Not found.............")
    }
})

app.post("/compose", async function (req, res) {
    const post = await Post.findOne({ Title: req.body.title });
    if (post === null) {
        let myPost = new Post({
            Title: _.capitalize(req.body.title),
            Content: req.body.message
        });
        myPost.save();
        postsArray = await Post.find();
        res.redirect("/");
    } else {
        await Post.findOneAndUpdate({ Title: req.body.title }, { Content: req.body.message });
        res.redirect("/");
    }
})

app.post("/delete", async function (req, res) {
    let deletingPostId = req.body.PostId;

    await Post.deleteOne({ _id: deletingPostId });
    res.redirect("/");
})


app.listen(3000, function () {
    console.log("Server started on port 3000");
});