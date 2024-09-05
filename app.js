const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js")
const path = require("path");
const methodOverride = require("method-override")

app.use(express.urlencoded({extended:true}));
app.set("view engine","views");
app.set("views",path.join(__dirname,"views"));
app.use(methodOverride("_method"));

const MONGO_URL='mongodb://127.0.0.1:27017/wanderlust';

main().then(()=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
}

app.get("/",(req,res)=>{
    res.send("Hi, I am root.");
});

//Index Route
app.get("/listing", async (req,res)=>{
    let AllListings = await Listing.find({});
    res.render("./listings/index.ejs",{AllListings});
});

//New Route
app.get("/listing/new",(req,res)=>{
    res.render("./listings/new.ejs");
});

//Show Route
app.get("/listing/:id",async(req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/show.ejs",{listing});
});

//Create Route
app.post("/listing",async(req,res)=>{
    const newListing=new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listing");
});

//Edit Route
app.get("/listing/:id/edit",async(req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs",{listing});
});

//Update Route
app.put("/listing/:id", async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listing/${id}`);
})

//Delete Route
app.delete("/listing/:id",async(req,res)=>{
    let {id} = req.params;
    let deletedListing  = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listing")
})
app.listen(8080,()=>{
    console.log("Server is listening to port 8080");
})