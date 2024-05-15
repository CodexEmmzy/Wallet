"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dataConnection_1 = require("./dataConnection");
const userRoutes = require('./routes/User');
const express = require('express');
const bodyParser = require('body-parser');
const error_1 = require("./middlewares/error");
require("express-async-errors");
const app = express();
const port = 3000;
app.use(bodyParser.json());
app.get("/", (_req, res) => {
    res.send("Hello World!");
});
app.use(express.json());
app.use(error_1.errorHandler);
app.use("/api/v1/user", userRoutes);
dataConnection_1.AppDataSource.initialize()
    .then(() => {
    console.log("Database connected");
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
})
    .catch((err) => {
    console.log(err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map