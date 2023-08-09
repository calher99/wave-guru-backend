const express = require("express");
const router = express.Router();

const { check } = require("express-validator");

const usersControllers = require("../controllers/users-controller");

// router.get("/", usersControllers.getUsers);

router.post("/fake/signup/Google", usersControllers.test);

router.post("/signup/Google", usersControllers.signUpGoogle);

router.post(
  "/signup",
  [
    check("email").normalizeEmail().isEmail(),
    check("password").not().isEmpty(),
  ],
  usersControllers.signUp
);



router.post(
  "/signin",
  [
    check("email").normalizeEmail().isEmail(),
    check("password").not().isEmpty(),
  ],
  usersControllers.logIn
);

module.exports = router;
