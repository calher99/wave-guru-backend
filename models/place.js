const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const placeSchema = new Schema(
  {
    data: { type: Number, required: true, unique: true },
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    value: { type: String, required: true },
    countryCode: { type: String, required: true },
    user: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  },
  {
    timestamps: true,
  }
);

placeSchema.plugin(uniqueValidator);
//uniqueValidator bc email will be unique
//It makes the queries to run faster

module.exports = mongoose.model("Place", placeSchema);
