const Question = require("../Models/Question");
const Result = require("../../Shared/Result");

const controllers = {
  user: require("./ctrlUser")
}

const jsonToObject = (json) => {
  return new Question(json);
};

const addQuestion = async (req, res) => {
  try {
    let userRef = null;
    let email = req.body.email;

    if (req.session.user) {
      userRef = req.session.user._id;
      email = req.session.user.email;
    }

    else  {
      const result = await controllers.user.getUser(req,res);
      if (result.success.status) userRef = result.data._id;
    }

    const questionJSON = {
      email: email,
      message: req.body.message,
      answer: "",
      status: "no-reply",
      userRef: userRef,
    };

    const question = jsonToObject(questionJSON);
    const result = await question.create();
    return res.json(result.toJSON());
  } catch (error) {
    return res.json(
      new Result(-1, null, `Error creating question: ${error.message}`).toJSON()
    );
  }
};

const removeQuestion = async (req, res) => {
  try {
    const id = req.query._id || req.body._id;
    const result = await Question.remove(id);
    return res.json(result.toJSON());
  } catch (error) {
    return res.json(
      new Result(-1, null, `Error deleting question: ${error.message}`).toJSON()
    );
  }
};

const getQuestion = async (req, res) => {
  try {
    const by = req.body.id == undefined ? "_id" : "id";
    const result = await Question.get(req.body.id == undefined ? req.body._id : req.body.id, by);
    return result;
  } catch (error) {
    return new Result(-1, null, `Error fetching question: ${error.message}`);
  }
};

const getQuestions = async (req, res) => {
  try {
    const result = await Question.getAll();
    req.session.questions = result.data || [];
    return res.json(result.toJSON());
  } catch (error) {
    return res.json(new Result(-1,null, `Error fetching questions: ${error.message}`).toJSON());
  }
};

const getSortedQuestions = async (req, res) => {
  try {
    const sortBy = req.body.sortBy || { createdAt: -1 };
    const limit = req.body.limit || 10;
    const result = await Question.getAll(sortBy, limit);
    req.session.questions = result.data || [];
    return result.toJSON();
  } catch (error) {
    return new Result(-1,  null, `Error fetching sorted questions: ${error.message}`).toJSON();
  }
}

const getQuestionsCount = async (req, res) => {
    try {
        const result = await Question.count();
        req.session.stats.question = result.data || 0
        return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error fetching question count: ${error.message}`).toJSON();
    }
}

const reply = async (req, res) => {
  try {
    let result = await Question.get(req.body.id);
    if (!result.success.status) return res.json(result.toJSON());
    const question = jsonToObject(result.data);
    result = await question.reply(req.body.answer);
    return res.json(result.toJSON());
  } catch (error) {
    return res.json(new Result( -1, null, `Error replying to question: ${error.message}`).toJSON())
  }
};

module.exports = {
  addQuestion,
  removeQuestion,
  getQuestion,
  getQuestions,
  getSortedQuestions,
  getQuestionsCount,
  reply,
};
