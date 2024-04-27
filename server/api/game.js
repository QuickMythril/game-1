const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const Game = require("../models/Game");
const User = require("../models/User");


module.exports = function (io) {

    router.get("/", async (req, res) => {
        try {
            const games = await Game.find()
            console.log({games})
          res.json('hello');
        } catch (err) {
          console.error(err.message);
          res.status(500).json({
            errors: [
              { msg: "Server error. Please try again or refresh the page." },
            ],
          });
        }
      });

      return router;

}