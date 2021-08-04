require('dotenv').config();

var bodyParser = require('body-parser')
var express = require("express")
var app = express()
var router = require("./routes/routes")
var cors = require('cors')

const PORT = process.env.PORT || 8686


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
// enable cors to other servers be able to use the api
app.use(cors())

app.use("/", router);

// utilizar .env
app.listen(PORT,() => {
    console.log("Server running on: " + PORT)
});
