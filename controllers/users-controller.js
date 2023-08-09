const HttpError = require("../models/http-error");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const { validationResult } = require("express-validator");
const { default: axios } = require("axios");

// const getUsers = async (req, res, next) => {};

const signUp = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    const firstError = errors.array()[0];
    return next(new HttpError(`${firstError.path} invalid`, 422));
  }
  console.log(req.body);
  const { email, password } = req.body;

  let hasUser;
  try {
    hasUser = await User.findOne({ email: email });
  } catch (error) {
    return next(
      new HttpError("Signing up failed, please try again later", 500)
    );
  }

  if (hasUser) {
    return next(new HttpError("Email already exists", 422));
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    return next(new HttpError("Password encryption failed", 500));
  }

  const createdUser = new User({
    email,
    password: hashedPassword,
  });

  try {
    await createdUser.save();
  } catch (error) {
    console.log(error);
    return next(
      new HttpError("Error while creating a new user, try again please", 500)
    );
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.TOKEN_STRING
      // { expiresIn: "1h" } To implement- refresh the token automatically once we are on the website
    );
  } catch (error) {
    return next(new HttpError("Error with token authentication", 500));
  }

  res.status(201);
  res.json({ userId: createdUser.id, token: token });
};

const logIn = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    const firstError = errors.array()[0];
    return next(new HttpError(`${firstError.path} invalid`, 422));
  }
  const { email, password } = req.body;

  let identifiedUser;
  try {
    identifiedUser = await User.findOne({ email: email });
  } catch (error) {
    return next(
      new HttpError("Signing up failed, please try again later", 500)
    );
  }

  if (!identifiedUser) {
    return next(new HttpError("Incorrect email", 401));
  }

  let isValidPassword = false;

  try {
    isValidPassword = await bcrypt.compare(password, identifiedUser.password);
  } catch (error) {
    return next(
      new HttpError("Error while decrypting the hasehd password", 500)
    );
  }

  if (isValidPassword === false) {
    return next(new HttpError("Incorrect password", 401));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: identifiedUser.id, email: identifiedUser.email },
      process.env.TOKEN_STRING
      // { expiresIn: "1h" }
    );
  } catch (error) {
    return next(new HttpError("Error with token authentication", 500));
  }

  res.status(201);
  res.json({ userId: identifiedUser.id, token: token });
};

const signUpGoogle = async (req, res, next) => {
  const { code } = req.body;

  let user;
  try {
    const response = await axios.get(
      "https://www.googleapis.com/userinfo/v2/me",
      {
        headers: { Authorization: `Bearer ${code}` },
      }
    );
    user = response.data;
 
  } catch (error) {
    console.log(error);
  }

  let hasUser;
  try {
    hasUser = await User.findOne({ email: user.email });
  } catch (error) {
    return next(
      new HttpError("Signing up failed, please try again later", 500)
    );
  }
  if (hasUser) {
    //log in
    let token;
    try {
      token = jwt.sign(
        { userId: hasUser.id, email: hasUser.email },
        process.env.TOKEN_STRING
        // { expiresIn: "1h" }
      );
    } catch (error) {
      return next(new HttpError("Error with token authentication", 500));
    }

    res.status(201);
    res.json({ userId: hasUser.id, token: token });

  } else {
    //signup
    const createdUser = new User({
      email: user.email,
    });

    try {
      await createdUser.save();
    } catch (error) {
      console.log(error);
      return next(
        new HttpError("Error while creating a new user, try again please", 500)
      );
    }

    let token;
    try {
      token = jwt.sign(
        { userId: createdUser.id, email: createdUser.email },
        process.env.TOKEN_STRING
        // { expiresIn: "1h" } To implement- refresh the token automatically once we are on the website
      );
    } catch (error) {
      return next(new HttpError("Error with token authentication", 500));
    }

    res.status(201);
    res.json({ userId: createdUser.id, token: token });
  }
  
};

const test = async (req, res, next) => {
  
  const user = {
    id: "115075244383602577689",
    email: "calher@gmail.com",
    verified_email: true,
    name: "Carlos Alonso",
    given_name: "Carlos",
    family_name: "Alonso",
    picture:
      "https://lh3.googleusercontent.com/a/AAcHTtcy-6oY4XVj_z2MXDtmIp4yUWzR8MSf07Iyg-bRyw3g72tS=s96-c",
    locale: "en",
  };

  let hasUser;
  try {
    hasUser = await User.findOne({ email: user.email });
  } catch (error) {
    return next(
      new HttpError("Signing up failed, please try again later", 500)
    );
  }
 
  if (hasUser) {
    //log in
    let token;
    try {
      token = jwt.sign(
        { userId: hasUser.id, email: hasUser.email },
        process.env.TOKEN_STRING
        // { expiresIn: "1h" }
      );
    } catch (error) {
      return next(new HttpError("Error with token authentication", 500));
    }

    res.status(201);
    res.json({ userId: hasUser.id, token: token });

  } else {
    //signup
    const createdUser = new User({
      email: user.email,
    });

    try {
      await createdUser.save();
    } catch (error) {
      console.log(error);
      return next(
        new HttpError("Error while creating a new user, try again please", 500)
      );
    }

    let token;
    try {
      token = jwt.sign(
        { userId: createdUser.id, email: createdUser.email },
        process.env.TOKEN_STRING
        // { expiresIn: "1h" } To implement- refresh the token automatically once we are on the website
      );
    } catch (error) {
      return next(new HttpError("Error with token authentication", 500));
    }

    res.status(201);
    res.json({ userId: createdUser.id, token: token });
  }
};

// exports.getUsers = getUsers;
exports.signUp = signUp;
exports.logIn = logIn;
exports.signUpGoogle = signUpGoogle;
exports.test = test;
