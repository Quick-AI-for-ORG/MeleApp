exports.renderStreamPage = (req, res) => {
    if (req.body && req.body.user){
    res.render("streaming",{ user: req.body.user });
    }
    else{
        res.redirect(`http://${process.env.IP}:3000/keeper/dashboard`)
    }
};
