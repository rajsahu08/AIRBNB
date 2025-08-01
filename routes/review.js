const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/reviews.js"); 
const Listing = require("../models/listing.js");
const {validateReview , isLoggedIn, isReviewAuthor} = require("../middleware.js");

//Reviews
//Post Route
router.post("/", isLoggedIn ,validateReview,wrapAsync(async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success","Successfully Created a New Review");
    res.redirect(`/listing/${listing._id}`);
}));

//DELETE REVIEW ROUTE
router.delete("/:reviewId",isLoggedIn, isReviewAuthor, wrapAsync(async(req,res)=>{
    let{id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Successfully Deleted Review");
    res.redirect(`/listing/${id}`);
}))

module.exports = router;