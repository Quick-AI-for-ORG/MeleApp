exports.renderStreamPage = (req, res) => {
    if (req.query.user) res.render("streaming",{ user: req.query.user, camera:req.query.camera || "Door" });
    else res.redirect(`http://${process.env.IP}:${process.env.PORT}/keeper/dashboard`)
};
