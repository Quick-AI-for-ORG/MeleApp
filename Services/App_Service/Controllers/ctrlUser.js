const User = require('../Models/User')
const addUser = async(req,res)=>{
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
    return result.toJSON()
}
const removeUser = async(req,res)=>{
    const result = await User.remove(req.body.email);
    return result.toJSON();
}
const getUser = async(req,res)=>{
    const result = await User.get(req.body.email)
    return result.toJSON()
}
const getUsers = async(req,res)=> {
    const result = await User.getAll();
    return result.toJSON();
}
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

const updateUser = async(req,res)=>{
    let update = {}
    Object.keys(User.attributes).forEach(attr => {
        if (req.body.hasOwnProperty(attr)) {
          update[attr] = req.body[attr];
        }
      });
    if(req.body.email == req.session.user.email){
        const user = new User(req.session.user)
        update.email = user.email
        const result = await user.modify(update)
        if(result.success.status) req.session.user = result.data
        else req.session.message = result.message
        res.redirect('/keeper')
    }
    else {
        const result = await User.modify(update)
        return result.toJSON()
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