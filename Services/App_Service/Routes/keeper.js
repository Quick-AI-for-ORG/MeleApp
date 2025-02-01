const express = require('express')
const router = express.Router()


router.get("/", (req, res) => {
    req.session.message = "Please login to access this page";
    res.redirect("/keeper/login");
    })
router.get("/signup", (req, res) => {
    let message = req.session.message === undefined ? null : req.session.message
    req.session.message = undefined ;
    res.render("signup", { layout: false,
      message: message
     });
  });
  
  router.get("/login", (req, res) => {
    let message = req.session.message === undefined ? null : req.session.message
    req.session.message = undefined ;
    res.render("login", { layout: false,
        message: message
     });
  });
  
  module.exports = router;