var createError = require('http-errors');
var bodyParser = require('body-parser')
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const connectDB=require("./config/db")
const app=express()

connectDB();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(cookieParser());

app.use("/api/users",require("./routes/api/users"))
app.use("/api/profile",require("./routes/api/profile"))
app.use("/api/posts",require("./routes/api/posts"))
app.use("/api/auth",require("./routes/api/auth"))
app.use("/api/Jobs",require("./routes/api/JobPost"))

app.get("/",(req,res)=>res.send("API running"))
const PORT=process.env.PORT || 5000;
app.listen(PORT,()=>console.log(`server started on ${PORT}`))