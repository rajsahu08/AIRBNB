const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn,isOwner,validateListing} = require("../middleware.js");

//Index Route
router.get("/", wrapAsync(async (req,res)=>{
    let AllListings = await Listing.find({});
    res.render("./listings/index.ejs",{AllListings});
}));

//New Route
router.get("/new", isLoggedIn ,(req,res)=>{
    res.render("./listings/new.ejs");
});

//Show Route
router.get("/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author"}}).populate("owner");
    if(!listing){
        req.flash("error","Listing Not Found");
        res.redirect("/listing");
    }
    console.log(listing);
    res.render("./listings/show.ejs",{listing});
}));

//Create Route
router.post("/",isLoggedIn,validateListing,wrapAsync(async(req,res,next)=>{
    const newListing=new Listing(req.body.listing);
    newListing.owner=req.user._id;
    await newListing.save();
    req.flash("success","Successfully Created a New Listing");
    res.redirect("/listing");
    })
);

//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner ,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing Not Found");
        res.redirect("/listing");
    }
    res.render("./listings/edit.ejs",{listing});
}));

//Update Route
router.put("/:id", isLoggedIn, isOwner ,validateListing, wrapAsync(async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    req.flash("success","Successfully Updated the Listing");
    res.redirect(`/listing/${id}`);
}));

//Delete Route
router.delete("/:id", isLoggedIn, isOwner ,wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let deletedListing  = await Listing.findByIdAndDelete(id);
    req.flash("success","Successfully Deleted the Listing");
    res.redirect("/listing");
}));

module.exports = router;