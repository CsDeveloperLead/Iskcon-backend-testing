const express = require("express");
const router = express.Router();
const { version, name, description } = require("../package.json");

router.get("/", async (req, res) => {
  // const ip = await axios.get('https://api.ipify.org/').then(e => e.data);

  return res.status(200).json({
    description,
    version,
    host: name,
  });
});

module.exports = router;
