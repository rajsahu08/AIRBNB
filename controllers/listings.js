const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req,res)=>{
    let AllListings = await Listing.find({});
    res.render("./listings/index.ejs",{AllListings});
}

module.exports.renderNewForm = (req,res)=>{
    res.render("./listings/new.ejs");
}

module.exports.showListing = async(req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author"}}).populate("owner");
    if(!listing){
        req.flash("error","Listing Not Found");
        res.redirect("/listing");
    }
    console.log(listing);
    res.render("./listings/show.ejs",{listing});
}

module.exports.createListing = async(req,res,next)=>{
  
let response = await geocodingClient.forwardGeocode({
query: req.body.listing.location,
limit: 1
})
.send();
    let url=req.file.path;
    let filename=req.file.filename;
    const newListing=new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image= {url, filename};
    newListing.geometry = response.body.features[0].geometry;
    await newListing.save();
    req.flash("success","Successfully Created a New Listing");
    res.redirect("/listing");
}

module.exports.renderEditForm = async(req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing Not Found");
        res.redirect("/listing");
    }
    res.render("./listings/edit.ejs",{listing});
}

module.exports.updateListing = async(req,res)=>{
    ;
    let {id}=req.params;
    
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    if(typeof req.file !== 'undefined'){
    let url=req.file.path;
    let filename=req.file.filename
    listing.image = {url, filename};
    await listing.save();
}
    req.flash("success","Successfully Updated the Listing");
    res.redirect(`/listing/${id}`);
}

module.exports.destroyListing = async(req,res)=>{
    let {id} = req.params;
    let deletedListing  = await Listing.findByIdAndDelete(id);
    req.flash("success","Successfully Deleted the Listing");
    res.redirect("/listing");
}