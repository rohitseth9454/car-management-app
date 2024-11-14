const express = require("express");
const Car = require("../models/Car");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const router = express.Router();

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.userId = decoded.id;
    next();
  });
};

// Set up multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Create Car Route
router.post("/", verifyToken, upload.array("images", 10), async (req, res) => {
  const { title, description, tags } = req.body;
  const images = req.files.map(file => file.path);
  try {
    const newCar = new Car({
      title,
      description,
      tags,
      images,
      user: req.userId,
    });
    await newCar.save();
    res.status(201).json(newCar);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// List Cars Route
router.get("/", verifyToken, async (req, res) => {
  try {
    const cars = await Car.find({ user: req.userId });
    res.json(cars);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get Car Details Route
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car || car.user.toString() !== req.userId) {
      return res.status(404).json({ message: "Car not found" });
    }
    res.json(car);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update Car Route
router.put("/:id", verifyToken, upload.array("images", 10), async (req, res) => {
  const { title, description, tags } = req.body;
  const images = req.files.map(file => file.path);
  try {
    const car = await Car.findById(req.params.id);
    if (!car || car.user.toString() !== req.userId) {
      return res.status(404).json({ message: "Car not found" });
    }

    car.title = title;
    car.description = description;
    car.tags = tags;
    car.images = [...car.images, ...images];
    await car.save();
    res.json(car);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete Car Route
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car || car.user.toString() !== req.userId) {
      return res.status(404).json({ message: "Car not found" });
    }

    await car.remove();
    res.json({ message: "Car deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
