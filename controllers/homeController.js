const BigPromise = require("../middlewares/bigPromise");

exports.home = (req, res) => {
  res.send("hi");
};

exports.homeDummy = (req, res) => {
  res.send("This is another dummy route");
};
