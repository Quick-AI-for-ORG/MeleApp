const controllers = {
  user: require("../Controllers/ctrlUser"),
  apiary: require("../Controllers/ctrlApiary"),
  product: require("../Controllers/ctrlProduct"),
  upgrades: require("../Controllers/ctrlUpgrade"),
  keeper: require("../Controllers/ctrlKeeper"),
  hive: require("../Controllers/ctrlHive"),
  question: require("../Controllers/ctrlQuestion"),
  sensor: require("../Controllers/ctrlSensor"),
  threat: require("../Controllers/ctrlThreat"),
  hiveUpgrade: require("../Controllers/ctrlUpgrade"),
}

const home = async (req, res) => {
  res.render("mele", { user: req.session.user || "" });
};

const about = async (req, res) => {
  await controllers.sensor.getSensors(req, res);
  res.render("aboutUs", {
    user: req.session.user || "",
    sensors: req.session.sensors || [],
  });
};

const login = async (req, res) => {
  let message = req.session.message === undefined ? null : req.session.message;
  req.session.message = undefined;
  res.render("login", { layout: false, message: message });
};

const signup = async (req, res) => {
  let message = req.session.message === undefined ? null : req.session.message;
  req.session.message = undefined;
  res.render("signup", { layout: false, message: message });
};
const noLogin = (req, res) => {
  req.session.message = "Please login to access this page";
  res.redirect("/login");
};
const products = async (req, res) => {
  req.session.productDetails = undefined;
  await controllers.product.getProducts(req, res);
  res.render("products", {
    user: req.session.user || "",
    products: req.session.products || [],
  });
};

const product = async (req, res) => {
  if (req.body.name) await controllers.product.getProduct(req, res);
  if (!req.session.productDetails) res.redirect("/products");
  res.render("product", {
    user: req.session.user || "",
    product: req.session.productDetails || {},
  });
};

const dashboard = async (req, res) => {
  let keepers, hives = await _inject(req, res);
  await controllers.product.getProducts(req, res);
  let message = req.session.message === undefined ? null : req.session.message;
  req.session.message = undefined;
  res.render("beekeeper", {
    layout: false,
    message: message,
    user: req.session.user || "",
    apiaries: req.session.user.apiaries || [],
    keepers: keepers || [],
    hives: hives || [],
    products: req.session.products || [],
  });
};

const profile = (req, res) => {
  let message = req.session.message === undefined ? null : req.session.message;
  req.session.message = undefined;
  res.render("profile", {
    layout: false,
    message: message,
    user: req.session.user || "",
  });
};

const notFound = (req, res) => {
  res.render("404", { user: req.session.user || "" });
};

const upgrade = async (req, res) => {
  let message = req.session.message === undefined ? null : req.session.message;

  req.session.message = undefined;
  await controllers.product.getProducts(req, res);
  await controllers.user.getApiaries(req, res);
  res.render("upgrade", {
    user: req.session.user || "",
    layout: false,
    message: message,
    kits: req.session.products || [],
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    apiaries: req.session.user.apiaries || [], // Changed from appiaries to apiaries
  });
};

const postUpgrade = (req, res) => {
  res.redirect("/keeper/dashboard");
};

const _inject = async (req, res) => {
  if(req.session.user.role == "Owner") await controllers.user.getApiaries(req, res);
  else await controllers.keeper.getKeeperApiaries(req, res); 
  let hives = [],  keepers = []
  for (let [i, apiary] of req.session.user.apiaries.entries()) {
    req.body._id = apiary._id;
    let result = await controllers.apiary.getApiaryHives(req, res);
    if (result.success.status) {
      apiary.hives = result.data || [];
      req.session.user.apiaries[i] = apiary;
      req.session.user.apiaries[i].hives = apiary.hives;
      hives.push(apiary.hives);
    }
    else req.session.message = result.message;
    result = await controllers.keeper.getApiaryKeepers(req, res);
    if (result.success.status)  {
      req.session.user.apiaries[i].keepers = result.data || [];
      keepers.push(result.data);
    }
    else req.session.message = result.message;
  }
  return keepers, hives
}

const adminDashboard = async (req, res) => {
  let message = req.session.message === undefined ? null : req.session.message;
  req.session.message = undefined;
  await _injectCount(req, res);
  await _injectRecent(req, res);

  res.render("admin", {
    layout: false,
    message: message,
    user: req.session.user || "",
    stats: req.session.stats || {},
    users: req.session.users || [],
    apiaries: req.session.apiaries || [],
    keepers: req.session.keepers || [],
    hives: req.session.hives || [],
    sensors: req.session.sensors || [],
    products: req.session.products || [],
    questions: req.session.questions || [],
    threats: req.session.threats || [],
    upgrades: req.session.upgrades || [],
  });
}


const _injectCount = async (req, res) => {
  req.session.stats = {}
  await controllers.user.getUsersCount(req, res);
  await controllers.apiary.getApiariesCount(req, res);
  await controllers.keeper.getKeepersCount(req, res);
  await controllers.hive.getHivesCount(req, res);
  await controllers.sensor.getSensorsCount(req, res);
  await controllers.product.getProductsCount(req, res);
  await controllers.question.getQuestionsCount(req, res);
  await controllers.threat.getThreatsCount(req, res);
  await controllers.hiveUpgrade.getUpgradesCount(req, res);
}

const _injectRecent = async (req, res) => {
  req.body.sortBy = { createdAt: -1 };
  req.body.limit = 10;
  await controllers.user.getSortedUsers(req, res);
  await controllers.apiary.getSortedApiaries(req, res);
  await controllers.hive.getSortedHives(req, res);
  await controllers.sensor.getSortedSensors(req, res);
  await controllers.product.getSortedProducts(req, res);
  await controllers.question.getSortedQuestions(req, res);
  await controllers.threat.getSortedThreats(req, res);
  await controllers.hiveUpgrade.getSortedUpgrades(req, res);
  await controllers.keeper.getSortedKeepers(req, res);
}

module.exports = {
  _PUBLIC: { home, about, products, product, noLogin, notFound },
  _KEEPER: { login, signup, profile, dashboard, upgrade, postUpgrade },
  _ADMIN: { adminDashboard },
};
