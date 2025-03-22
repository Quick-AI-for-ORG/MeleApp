const Result = require("../../Shared/Result");
const hiveUpgrade = require("../Models/HiveUpgrade");
const controllers = {
    user: require('./ctrlUser'),
    apiary: require('./ctrlApiary'),
    sensor: require('./ctrlSensor'),
    product: require('./ctrlProduct'),
    hive: require('./ctrlHive'),
}
const { sendUpgradeConfirmation } = require("../../Utils/mailer");
const weatherService = require("../../Utils/weatherService");

const upgrade = async (req, res) => {
    try {        
        const user = controllers.user._jsonToObject(req.session.user);
        const apiaries = await controllers.user.getApiaries(req, res);
        const newApiary = !req.session.user.apiaries.some(apiary => apiary.name === req.body.apiaryName);
        
        let apiary = null;
        if (newApiary) {
            req.body.owner = user._id;
            const result = await controllers.apiary.addApiary(req, res);
            if (result.success.status) apiary = result.data;
            else return res.json(result.toJSON());
        } else {
            apiary = apiaries.data.find(apiary => apiary.name === req.body.apiaryName);
            if (!apiary) return res.json(new Result(-1, null, `Error fetching apiary: Apiary not found`).toJSON());
            else await controllers.apiary._jsonToObject(apiary).increment(req.body.numberOfHives);
        }

        let hives = [];
        for (let i = 0; i < req.body.numberOfHives; i++) {
            req.body.apiaryRef = apiary._id;
            const result = await controllers.hive.addHive(req, res);
            if (!result.success.status) return res.json(result.toJSON());
            else hives.push(controllers.hive._jsonToObject(result.data));
        }

        let products = [];
        for (let i = 0; i < req.body.kitSelection.length; i++) {
            const productName = req.body.kitSelection[i];
            req.body.name = productName;
            
            const productResult = await controllers.product.getProduct(req, res);
            if (!productResult.success.status) return res.json(productResult.toJSON());
            
            let product = controllers.product._jsonToObject(productResult.data);
            const incrementResult = await product.increment();
            if (!incrementResult.success.status) return res.json(incrementResult.toJSON());
            
            products.push(product);
            
            for (let j = 0; j < hives.length; j++) {
                const hive = hives[j];
                req.body.hiveRef = hive._id;
                req.body.productRef = product._id;
                
                const upgradeResult = await addHiveUpgrade(req, res);
                if (!upgradeResult.success.status) return res.json(upgradeResult.toJSON());
            }
        }
        
        // const emailResult = await sendEmail(req, res);
        // if (!emailResult.success.status) return res.json(emailResult.toJSON());
        
        return res.redirect('/keeper');
    } catch (error) {
        console.error("Upgrade error:", error);
        return res.json(new Result(-1, null, `Error upgrading user: ${error.message}`).toJSON());
    }
};


const addHiveUpgrade = async (req, res) => {
    try {
        const upgradeJSON = {
            hiveRef: req.body.hiveRef,
            productRef: req.body.productRef,
            userRef: req.session.user._id,
            operational: false,
        }
        const upgrade = new hiveUpgrade(upgradeJSON);
        const result = await upgrade.create();
        return result;
    } catch (error) {
        return new Result(-1, null, `Error creating hive upgrade: ${error.message}`);
    }
}

const getUpgrade = async (req, res) => {
    try {
        const result = await hiveUpgrade.get(req.body._id);
        return res.json(result.toJSON());
    } catch (error) {
        return res.json(new Result(-1, null, `Error fetching hive upgrade: ${error.message}`).toJSON());
    }
}

const getUpgrades = async (req, res) => {
    try {
        const result = await hiveUpgrade.getAll();
        req.session.upgrades = result.data || [];
        return res.json(result.toJSON());
    } catch (error) {
        return res.json(new Result(-1, null, `Error fetching hive upgrades: ${error.message}`).toJSON());
    }
}

const makeOperational = async (req, res) => {
    try {
        const upgrade = await hiveUpgrade.get(req.body._id);
        const result = await upgrade.makeOperational();
        return res.json(result.toJSON());
    } catch (error) {
        return res.json(new Result(-1, null, `Error updating hive upgrade: ${error.message}`).toJSON());
    }
}


const sendEmail = async (req, res) => {
    try {
      const { apiaryName, latitude, longitude } = req.body;
  
      const weatherData = await weatherService.logWeatherData(
        apiaryName,
        latitude,
        longitude
      );
  
      const formDataWithWeather = {
        ...req.body,
        weather: weatherData,
      }
      const emailSent = await sendUpgradeConfirmation(
        req.session.user.email,
        formDataWithWeather
      )
      if (!emailSent) {
        req.session.message = "Please try again";
        return res.redirect("/keeper/upgrade");
      }
        return new Result(1, null, "Upgrade email sent successfully").toJSON()    
    } catch (error) {
      console.error("Upgrade email error:", error);
      return new Result(-1, null, `Error sending upgrade email: ${error.message}`).toJSON();
    }
  };


module.exports = {
    upgrade,
    getUpgrade,
    getUpgrades,
    makeOperational,
    sendEmail
}