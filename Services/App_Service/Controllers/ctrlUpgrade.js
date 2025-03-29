const Result = require("../../Shared/Result");
const hiveUpgrade = require("../Models/HiveUpgrade");
const controllers = {
    user: require('./ctrlUser'),
    apiary: require('./ctrlApiary'),
    sensor: require('./ctrlSensor'),
    product: require('./ctrlProduct'),
    hive: require('./ctrlHive'),
}
const { sendUpgradeConfirmation } = require("../Utils/mailer");
const weatherService = require("../Utils/weatherService");

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
            else {
                req.session.message = result.message;
                return res.redirect("/keeper/upgrade");
            }
        } else {
            apiary = apiaries.data.find(apiary => apiary.name === req.body.apiaryName);
            if (!apiary) { 
                const error = new Result(-1, null, `Error fetching apiary: Apiary not found`)
                req.session.message = error.message;
                return res.redirect("/keeper/upgrade");
            }
            else await controllers.apiary._jsonToObject(apiary).increment(req.body.numberOfHives);
        }

        let hives = [];
        for (let i = 0; i < req.body.numberOfHives; i++) {
            req.body.apiaryRef = apiary._id;
            const result = await controllers.hive.addHive(req, res);
            if (!result.success.status) {
                req.session.message = result.message;
                return res.redirect("/keeper/upgrade");
            }
            else hives.push(controllers.hive._jsonToObject(result.data));
        }

        let products = [];
        for (let i = 0; i < req.body.kitSelection.length; i++) {
            const productName = req.body.kitSelection[i];
            req.body.name = productName;
            
            const productResult = await controllers.product.getProduct(req, res);
            if (!productResult.success.status) {
                req.session.message = productResult.message;
                return res.redirect("/keeper/upgrade");
            }
            
            let product = controllers.product._jsonToObject(productResult.data);
            const incrementResult = await product.increment();
            if (!incrementResult.success.status) {
                req.session.message = incrementResult.message;
                return res.redirect("/keeper/upgrade");
            }
            
            products.push(product);
            
            for (let j = 0; j < hives.length; j++) {
                const hive = hives[j];
                req.body.hiveRef = hive._id;
                req.body.productRef = product._id;
                
                const upgradeResult = await addHiveUpgrade(req, res);
                if (!upgradeResult.success.status) {
                    req.session.message = upgradeResult.message;
                    return res.redirect("/keeper/upgrade");
                }
            }
        }
        
        const emailResult = await sendEmail(req, res);
        if (!emailResult.success.status) {
            req.session.message = emailResult.message;
            return res.redirect("/keeper/upgrade");
        }
        
        return res.redirect('/keeper');
    } catch (error) {
        console.error("Upgrade error:", error);
        req.session.message = "Error upgrading: "+error.message;
        return res.redirect("/keeper/upgrade");
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


const getUpgradedHive = async (req, res) => {
    try {
        let result = await controllers.hive.getHive(req,res);
        if(result.success.status) {
            let hive = controllers.hive._jsonToObject(result.data);

            result = await hive.getThreats();
            if(!result.success.status) return res.json(result.toJSON());
            hive.threats = result.data || [];

            result = await hive.getReadings();
            if(!result.success.status) return res.json(result.toJSON());
            hive.readings = result.data || [];

            result = await hive.getUpgrades();
            if(!result.success.status) return res.json(result.toJSON());
            hive.upgrades = result.data || [];

            hive.products = [], hive.sensors = []
            for (let i = 0; i < hive.upgrades.length; i++) {
                req.body._id = hive.upgrades[i].productRef;
                result = await controllers.product.getProduct(req,res)
                if(!result.success.status) return res.json(result.toJSON());
                let product = controllers.product._jsonToObject(result.data)
                for (let j = 0; j < product.sensors; j++) {
                    req.body._id = product.sensors[j];
                    result = await controllers.sensor.getSensor(req,res)
                    if(!result.success.status) return res.json(result.toJSON());
                    const sensor = controllers.sensor._jsonToObject(result.data);
                    product.sensors[j] = sensor;
                    hive.sensors.some(s => s._id === sensor._id) || hive.sensors.push(sensor);
                }
                hive.products.push(product);
            }

            return res.json(new Result(1, hive, "Hive Fetched and Injected with data").toJSON());
        }
        else return res.json(result.toJSON());
    } catch (error) {
        return res.json(new Result(-1, null, `Error fetching hive: ${error.message}`).toJSON());
    }
}


const sendEmail = async (req, res) => {
    try {
      const { apiaryName, latitude, longitude } = req.body;
  
      const weatherData = weatherService.logWeatherData(
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
        return new Result(0, null, "Error sending upgrade email")
      }
        return new Result(1, null, "Upgrade email sent successfully")  
    } catch (error) {
      console.error("Upgrade email error:", error);
      return new Result(-1, null, `Error sending upgrade email: ${error.message}`)
    }
  };


module.exports = {
    upgrade,
    getUpgrade,
    getUpgrades,
    makeOperational,
    sendEmail,
    getUpgradedHive
}