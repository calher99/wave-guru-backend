const HttpError = require("../models/http-error");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const { validationResult } = require("express-validator");

// const getUsers = async (req, res, next) => {};

const signUp = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors)
    const firstError = errors.array()[0];
    return next(
      new HttpError(`${firstError.path} invalid` , 422),
    );
  }
  console.log(req.body)
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
    return next(
      new HttpError("Email already exists", 422)
    );
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
      process.env.TOKEN_STRING,
      // { expiresIn: "1h" } To implement- refresh the token automatically once we are on the website
    );
  } catch (error) {
    return next(new HttpError("Error with token authentication", 500));
  }

  res.status(201);
  res.json({ userId: createdUser.id, token: token});
};

const logIn = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors)
    const firstError = errors.array()[0];
    return next(
      new HttpError(`${firstError.path} invalid` , 422),
    );
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
    return next(new HttpError("Error while decrypting the hasehd password", 500));
  }

  if (isValidPassword === false) {
    return next(new HttpError("Incorrect password", 401));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: identifiedUser.id, email: identifiedUser.email },
      process.env.TOKEN_STRING,
      // { expiresIn: "1h" }
    );
  } catch (error) {
    return next(new HttpError("Error with token authentication", 500));
  }

  res.status(201);
  res.json({ userId: identifiedUser.id , token: token});
};

const signUpGoogle = async (req, res, next) => {
  
  console.log("Code", req.body)
  const { code } = req.body;
  //TO DO 
  // 1. Fb and Google user dont have a password
  // 2. Password is not required
  // 3. We cannot access to non password users through normal Authenticaton 
  // 4. Flow
  //       pass the oAuth code to server
  //       send request to google api with oAuth code to get me 
  //       check if email already exists on my db 
  //       if exists => do normal login returning token 
  //        not then create a user with no pasword 

  let user ;
  try {
    const response = await fetch(
      "https://www.googleapis.com/userinfo/v2/me",
      {
        headers: { Authorization: `Bearer ${code}` },
      }
    );
    user = await response.json();
    
  } catch (error) {
    console.log(error);
  }
  console.log("User info",user)
  res.status(201);
  
};

// exports.getUsers = getUsers;
exports.signUp = signUp;
exports.logIn = logIn;
exports.signUpGoogle= signUpGoogle;
