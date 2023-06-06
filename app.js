const express = require("express");
const app = express();
const PORT = process.env.port || 5000;
const mongoose = require("mongoose");
const { mongoUrl } = require("./keys");
const cors = require("cors");
const path = require("path");


require('./models/model');
require('./models/post');

// connecting database
mongoose.connect(mongoUrl);
mongoose.connection.on("connected", () => {
    console.log("Successfully connected to mongo");
} )

mongoose.connection.on("error", () => {
    console.log("not connected to mongodb");
})


// middleware
app.use(cors());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(express.json());
app.use(require("./routes/auth"));
app.use(require("./routes/createPost"));
app.use(require("./routes/user"));

// serving frontend
app.use(express.static(path.join(__dirname, "./frontend/build")))

app.get("*", (req, res) => {
    res.sendFile(
        path.join(__dirname, "./frontend/build/index.html"),
        function(err){
            res.status(500).send(err)
        }
    )
})


// listener
app.listen(PORT, () => {
    console.log("server is running on "+PORT);
})
