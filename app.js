const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

const app = express();

// this middleware set header all the res going out from our server which allow the browser to share resource across servers. and prevent CORS Error.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// both fileStorage and fileFilter are the helper function of the multer. filestoreage function describe the destionation where the file will be saved and filename key defines what the filename will be when saved.
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});
//filefilter function checks the filetypes of the files. making sure we are uploading only image files.
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// app.use(bodyParser.urlencoded()); (to get data from form submition.)
app.use(bodyParser.json()); //application/json

//adding multer middleware
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

//any request to /images will be handled by this middleware which will server static images from the image folder in the parent directory.
app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

//this middleware chatches all the error we throw anywhere in the app.
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    "mongodb+srv://aniketsaurav:Aniket%232486@cluster0.xxs8c7n.mongodb.net/Rest_API_practice?retryWrites=true&w=majority"
  )
  .then((result) => {
    const server = app.listen(8080);
    const io = require("socket.io")(server);
    io.on("connection", (socket) => {
      console.log("client connected");
    });
  })
  .catch((err) => {
    console.log(err);
  });
