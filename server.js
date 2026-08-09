const express = require("express")
const path = require("path")
const User = require("./models/user")
require("./database/db")
const app = express()
const multer = require("multer")
const { exec } = require("child_process")


const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, "uploads/")
    },
    filename: function (req, file, cb){
        cb(null, "input.jpg")
    }
})
const upload = multer({ storage });

app.use(express.json())
app.use(express.urlencoded({extended:true}))

// serve frontend
app.use(express.static(__dirname))
app.use("/uploads", express.static("uploads"))

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
app.get("/test-db", async (req,res)=>{

 const test = await User.create({
    username: "test",
    email: "test@gmail.com",
    password: "123"
 })

 res.send(test)

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
app.post("/login", async (req,res) => {
    const {email,password} = req.body;
    try{
        const user = await User.findOne({
            $or: [{email: email}, {username: email}],
            password: password
        });
    if(user){
        res.redirect("/dashboard.html");
    }
    else{
        res.send("Invalid Login");
    }
    }
    catch(error){
        console.log(error);
        res.send("Error occured");
    }
    
});

app.post("/upload",
    upload.single("image"), (req,res) => {
        console.log("File recieved", req.file);
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        res.json({ message: "Uploaded successfully" });
    }
)

app.post("/detect", (req, res) => {
    console.log("Detect route called");

    const { exec } = require("child_process");
    const fs = require("fs");
    const path = require("path");

    exec("python detect.py uploads/input.jpg", (error, stdout, stderr) => {

        if (error) {
            console.log("Python Error:", stderr);
            return res.status(500).json({ error: "Detection failed" });
        }

        console.log("Detection successful");
        
        const resultPath = path.join(__dirname, "uploads", "result.json");
        try {
            if (fs.existsSync(resultPath)) {
                const resultData = fs.readFileSync(resultPath, "utf-8");
                const parsed = JSON.parse(resultData);
                res.json({
                    result: "/" + (parsed.output_path || "uploads/output.jpg"),
                    detected: parsed.detected || []
                });
            } else {
                res.status(500).json({ error: "Detection results not found" });
            }
        } catch(e) {
            console.log("JSON Parse Error:", e);
            res.status(500).json({ error: "Malformed detection results" });
        }
    });
});
app.listen(3000,()=>{
    console.log("Server running on port 3000")
})