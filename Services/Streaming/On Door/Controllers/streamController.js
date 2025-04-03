exports.renderStreamPage = (req, res) => {
    if (req.query.user) res.render("streaming",{ user: req.query.user });
    else res.redirect(`http://${process.env.IP}:3000/keeper/dashboard`)
};
