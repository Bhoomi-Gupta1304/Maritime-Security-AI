const express = require("express")
const path = require("path")
const User = require("./models/user")
require("./database/db")
const app = express()


app.use(express.json())
app.use(express.urlencoded({extended:true}))

// serve frontend
app.use(express.static(__dirname))

// routes
app.get("/", (req,res)=>{
    res.sendFile(path.join(__dirname,"login.html"))
})

app.get("/dashboard",(req,res)=>{
    res.sendFile(path.join(__dirname,"dashboard.html"))
})

app.get("/livefeed",(req,res)=>{
    res.sendFile(path.join(__dirname,"livefeed.html"))
})

app.get("/alerts",(req,res)=>{
    res.sendFile(path.join(__dirname,"alert.html"))
})
app.post("/register", async (req,res)=>{

const {username,email,password} = req.body

const newUser = new User({
    username,
    email,
    password
})

await newUser.save()

res.send("User Registered Successfully")

})
app.listen(3000,()=>{
    console.log("Server running on port 3000")
})