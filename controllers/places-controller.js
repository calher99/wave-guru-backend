const HttpError = require("../models/http-error");

const Place = require("../models/place");
const User = require("../models/user");


const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.userId;
    let places;
  
    try {
      places = await Place.find({ user: userId });
    } catch (error) {
      return next(
        new HttpError(
          "Error while retrieving the place",
          500
        )
      );
    }
    if (!places) {
      new HttpError("Could not find a place for the provided id", 404);
    } else {
      //Getters : true so we get rid of an underscore in the id
      res.json({
        places: places.map((place) =>
          place.toObject({ getters: true })
        ),
      });
    }
  };
  

const addPlaceToUser = async (req, res, next) => {
  const { data, lat, lon, value, countryCode } = req.body;

  const createdPlace = new Place({
    data,
    lat,
    lon,
    value,
    countryCode,
  });

  let user;
  try {
    user = await User.findById(req.usedData.userId).populate('places');;
  } catch (error) {
    console.log(error);
    return next(
      new HttpError("Error while creating a new Place, try again please", 500)
    );
  }
  if (!user) {
    return next(
      new HttpError("Could not find the user for the provided id", 404)
    );
  }
  const duplicatePlace = user.places.find((place) => {
    
    return place.data === createdPlace.data;
  });

  if (duplicatePlace) {
    return next(
      new HttpError("Place already saved", 404)
    );
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess }); // save playlist
    user.places.push(createdPlace); // add playlist to user's playlists
    await user.save({ session: sess }); // save user
    await sess.commitTransaction(); // commit transaction
  } catch (error) {
    console.log(error);
    return next(
      new HttpError("Creating place failed, please try again.", 500)
    );
  }

  res
    .status(201)
    .json({ place: createdPlace.toObject({ getters: true }) });
};

const deletePlaceById = async (req, res, next) => {
    const placeId = req.params.placeId;
  
    let place;
    try {
      //populate makes us to get the information of the user also
      place = await Place.findById(placeId).populate(
        "user",
        "places"
      );
    } catch (error) {
      new HttpError("Something went wrong,try again please", 500);
    }
    if (!place) {
      new HttpError(
        "Could not retrive the place to be removerd, try again please",
        500
      );
    }
    //We have the id of user because of populate
    if (place.user.id !== req.usedData.userId) {
      return next(new HttpError("You are not allowed to delete this place"), 401);
    }
  
    try {
      
      const sess = await mongoose.startSession();
      sess.startTransaction();
      await Place.deleteOne({ _id: place._id }, { session: sess });
      await User.updateOne(
        { _id: place.user },
        { $pull: { place: place._id } },
        { session: sess, new: true }
      );
  
      await sess.commitTransaction();
    } catch (error) {
      console.log(error);
      return next(
        new HttpError("Error while deleting the place try again please", 500)
      );
    }
  
    res.status(200); //Convention is 201 when you submit something correctly
    res.json({ message: "Deleted place" });
  };
  

exports.addPlaceToUser = addPlaceToUser;
exports.getPlacesByUserId = getPlacesByUserId;
exports.deletePlaceById = deletePlaceById;
