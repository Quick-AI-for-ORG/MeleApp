const User = require('../Models/User')

const addUser = async(req,res)=>{}
const removeUser = async(req,res)=>{}
const updateUser = async(req,res)=>{}
const getUser = async(req,res)=>{}
const getUsers = async(req,res)=>{}
const register = async(req,res)=>{
    const userJSON = {
        name: `${req.body.fname} ${req.body.lname}`,
        email: req.body.email,
        password: req.body.password,
        tel: req.body.phoneNumber,
        address: req.body.address || '',
        affiliation: req.body.affiliation || '',
    }
    const user = new User(userJSON)
    const result = await user.create()
    if(result.success.status) req.session.user = result.data
    else req.session.message = result.message
    res.redirect('/keeper')
}
const login = async(req,res)=>{
    try {
        const result = await User.login(req.body.email,req.body.password)
        if(result.success.status) {
            const user = result.data;
            const nameParts = user.name ? user.name.split(' ') : ['', ''];
            req.session.user = {
                _id: user._id,
                email: user.email,
                role: user.role,
                name: user.name,
                firstName: nameParts[0],
                lastName: nameParts.slice(1).join(' ') // Handle middle names if any
            };
        } else {
            req.session.message = result.message
        }
        res.redirect('/keeper')
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Login failed" });
    }
}

module.exports = {
    addUser,
    removeUser,
    updateUser,
    getUser,
    getUsers,
    register,
    login
}