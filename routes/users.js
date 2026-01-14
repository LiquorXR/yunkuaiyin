var express = require("express");
var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  const users = [
    {
      id: 1,
      name: "John Doe",
      age: 25,
    },
    {
      id: 2,
      name: "Jane Smith",
      age: 28,
    },
    {
      id: 3,
    },
  ];
  res.send(users);
});

module.exports = router;
