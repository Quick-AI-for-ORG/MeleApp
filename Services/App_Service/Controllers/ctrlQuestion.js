const Question = require('../Models/Question')
const Result = require("../../Shared/Result")
const ctrlUser = require('./ctrlUser')

const jsonToObject = (json) => {
    return new Question(json)
}

const addQuestion = async (req, res) => {
    try {
        let userRef = null
        if(!req.session.user) {
        const userResult = await ctrlUser.getUser(req,res)
        if(userResult.success.status) userRef = userResult.data._id
        }
        else userRef = req.session.user._id   
            const questionJSON = {
            email: req.session.user.email || req.body.email,
            message: req.body.message,
            answer: req.body.answer || '',
            status: req.body.status || 'no-reply',
            userRef: userRef 
        }
        const question = jsonToObject(questionJSON)
        const result = await question.create()
        return res.json(result.toJSON())
    } catch (error) {
        return res.json(new Result(-1, null, `Error creating question: ${error.message}`).toJSON())
    }
}

const removeQuestion = async (req, res) => {
    try {
        const result = await Question.remove(req.query.id)
        return res.json(result.toJSON())
    } catch (error) {
        return res.json(new Result(-1, null, `Error deleting question: ${error.message}`).toJSON())
    }
}

const getQuestion = async (req, res) => {
    try {
        const by = req.body.id == undefined ? "_id" : "id"
        const result = await Question.get(req.body.id == undefined ? req.body._id : req.body.id, by)
        return result
    } catch (error) {
        return new Result(-1, null, `Error fetching question: ${error.message}`)
    }
}

const getQuestions = async (req, res) => {
    try {
        const result = await Question.getAll()
        return res.json(result.toJSON())
    } catch (error) {
        return res.json(new Result(-1, null, `Error fetching questions: ${error.message}`).toJSON())
    }
}

const reply = async (req, res) => {
    try {
        let result = await Question.get(req.body.id)
        if (!result.success.status) return res.json(result.toJSON())
        const question = jsonToObject(result.data)
        result = await question.reply(req.body.answer)
        return res.json(result.toJSON())
    } catch (error) {
        return res.json(new Result(-1, null, `Error replying to question: ${error.message}`).toJSON())
    }
}


module.exports = {
    addQuestion,
    removeQuestion,
    getQuestion,
    getQuestions,
    reply
}