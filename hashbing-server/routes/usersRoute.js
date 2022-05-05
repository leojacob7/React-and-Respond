const express = require("express");
const path = require("path");
const { ObjectID } = require("mongodb");
const router = express.Router();
const users = require("../data/users");
const session = require("express-session");
const xss = require("xss");
const multer = require("multer");
const {
  handleUserInfo,
  objectIdToString,
  isValidEmail,
} = require("../utils/utils");

//Multer Functions required
const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function (req, file, cb) {
    cb(null, "IMAGE-" + Date.now() + path.extname(file.originalname));
  },
});

//upload parameters for multer
const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 1024 * 1024 * 3,
  },
}).single("myImage");

router.post("/upload", function (req, res) {
  console.log("File is", req.file);
  upload(req, res, function (err) {
    console.log("Request ---", req.body);
    console.log("Request file ---", req.file); //Here you get file.
    /*Now do where ever you want to do*/
    if (!err) {
      return res.send(200).end();
    }
  });
});

router.get("/profilePic", function (req, res) {
  console.log("File is", req.file);
  upload(req, res, function (err) {
    console.log("Request ---", req.body);
    console.log("Request file ---", req.file); //Here you get file.
    /*Now do where ever you want to do*/
    if (!err) {
      return res.send(200).end();
    }
  });
});

router.get("/test", async (req, res) => {
  return res.json({ test: "test" });
});

router.post("/signup", async (req, res) => {
  try {
    let { email, firstName, lastName } = req.body;
    if (!email || !firstName || !lastName) {
      return res.sendStatus(400).send("Missing required fields");
    } else {
      let user = {
        email: email,
        firstName: firstName,
        lastName: lastName,
      };
      console.log("here");
      // return res.sendStatus(200).json({ data: 1 });
      const data = await users.createUser(user);
      console.log("here after", data);
      return res.status(200).json({ data: data });
      console.log("here after again");
    }
  } catch (err) {
    console.log("err>>>>>>>>>>>>>>>>>>>>>>", err);
    return res.json({ error: err });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email } = req.body;
    isValidEmail(email);
    const { authenticated, user } = await users.authenticateUser(email);
    if (authenticated) {
      req.session.userid = objectIdToString(user._id);
      const userInfo = handleUserInfo(user);
      console.log(req.session);
      res.json(userInfo);
    }
  } catch (error) {
    res.status(400).send(error?.message ?? error); //need to render
  }
});

module.exports = router;
