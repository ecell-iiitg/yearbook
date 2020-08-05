const express = require("express");
const app = express();
const server = require("http").createServer(app);

app.use("/", (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

app.use("/yearbook", express.static('res/yearbook'))

app.use("/", (req, res) => {
    res.send("Server running...");
});

const PORT = 3000;
server.listen(PORT, function () {
    console.log("Server running on http://localhost:" + PORT);
});

