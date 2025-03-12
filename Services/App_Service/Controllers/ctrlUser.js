const User = require('../Models/User')
const Result = require("../../Shared/Result")

const addUser = async (req, res) => {
    try {
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
        return res.json(result.toJSON())
    }
    catch (error) {
        return res.json(new Result(-1, null, `Error creating user: ${error.message}`).toJSON())
    }
}

const removeUser = async (req, res) => {
    try {
        const result = await User.remove(req.body.email);
        return res.json(result.toJSON());
    }
    catch (error) {
        return res.json(new Result(-1, null, `Error deleting user: ${error.message}`).toJSON())
    }
}

const getUser = async (req, res) => {
    try {
        const result = await User.get(req.body.email)
        return res.json(result.toJSON())
    }
    catch (error) {
        return res.json(new Result(-1, null, `Error fetching user: ${error.message}`).toJSON())
    }
}

const getUsers = async (req, res) => {
    try {
        const result = await User.getAll();
        return res.json(result.toJSON());
    }
    catch (error) {
        return res.json(new Result(-1, null, `Error fetching users: ${error.message}`).toJSON())
    }
}

const updateUser = async (req, res) => {
    try {
        let update = {}
        Object.keys(User.attributes).forEach(attr => {
            if (req.body.hasOwnProperty(attr)) {
                update[attr] = req.body[attr];
            }
        });
        update.name = req.body.firstName + ' ' + req.body.lastName
        if (req.body.email == req.session.user.email) {
            const user = new User(req.session.user)
            update.email = user.email
            const result = await user.modify(update)
            if (result.success.status) req.session.user = result.data
            else req.session.message = result.message
            res.redirect('/keeper/profile')
        }
        else {
            const result = await User.modify(update)
            return res.json(result.toJSON())
        }
    }
    catch (error) {
        return res.json(new Result(-1, null, `Error updating user: ${error.message}`).toJSON())
    }
}

const register = async (req, res) => {
    try {
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
        if (result.success.status) req.session.user = result.data
        else req.session.message = result.message
        res.redirect('/keeper')
    }
    catch (error) {
        return res.json(new Result(-1, null, `Error creating user: ${error.message}`).toJSON())
    }
}

const login = async (req, res) => {
    try {
        const result = await User.login(req.body.email, req.body.password)
        if (result.success.status) {
            const user = result.data;
            const nameParts = user.name ? user.name.split(' ') : ['', ''];
            req.session.user = {
                _id: user._id,
                email: user.email,
                role: user.role,
                name: user.name,
                firstName: nameParts[0],
                lastName: nameParts.slice(1).join(' ')
            };
        } else {
            req.session.message = result.message
        }
        res.redirect('/keeper')
    }
    catch (error) {
        return res.json(new Result(-1, null, `Error fetching user: ${error.message}`).toJSON())
    }
}

const logout = (req, res) => {
    req.session.user = undefined;
    res.redirect('/')
}

const getApiaries = async (req, res) => {
    try {
    const user = new User(req.session.user)
    if (user) {
        const result = await user.getApiaries()
        if(result.success.status) req.session.user.apiaries = result.data
        else req.session.message = result.message
        return result.toJSON()
    }
    return new Result(-1, null, 'No user logged in').toJSON()
    }
    catch (error) {
        return new Result(-1, null, `Error fetching apiaries: ${error.message}`).toJSON()
    }
}

const upgrade = (req, res) => {
    try{
        const user = req.session.user
        if (user) {
            const result = user.purchaseUpgrade(upgradeJSON)
            if(result.success.status) req.session.user = result.data
            else req.session.message = result.message
            return res.json(result.toJSON())
        }
        return res.json(new Result(-1, null, 'No user logged in').toJSON())
    }
    catch (error) {
        return res.json(new Result(-1, null, `Error upgrading user: ${error.message}`).toJSON())
    }
}

module.exports = {
    addUser,
    removeUser,
    updateUser,
    getUser,
    getUsers,
    register,
    login,
    logout,
    getApiaries
}