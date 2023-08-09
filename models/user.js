const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false, minlength: 6 },
  places: [{ type: mongoose.Types.ObjectId, ref: "Places" }],
});

userSchema.plugin(uniqueValidator);
//uniqueValidator bc email will be unique
//It makes the queries to run faster

module.exports = mongoose.model("User", userSchema);
