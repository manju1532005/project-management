const express = require("express");
const router = express.Router();
const { getDummyIdeas, getRealIdeas } = require("../controllers/aiController");

router.post("/dummy", getDummyIdeas);

router.post("/real", getRealIdeas);

module.exports = router;
