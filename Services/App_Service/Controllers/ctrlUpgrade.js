const Result = require("../../Shared/Result");
const HiveUpgrade = require("../Models/HiveUpgrade");
const controllers = {
    user: require('./ctrlUser'),
    apiary: require('./ctrlApiary'),
    sensor: require('./ctrlSensor'),
    product: require('./ctrlProduct'),
    hive: require('./ctrlHive'),
    keeper: require('./ctrlKeeper'),
    threat: require('./ctrlThreat'),
    reading: require('./ctrlReading'),
}
const { sendUpgradeConfirmation } = require("../Utils/mailer");


const _jsonToObject = (json) => {
    return new HiveUpgrade(json)
}

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
            req.body._id = apiary._id;
            const forecast = await controllers.apiary.updateForecast(req, res);
            if(!forecast.success.status) {
                req.session.message = forecast.message;
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
        
        if(!newApiary) { 
            req.body.latitude = apiary.location.latitude
            req.body.longitude = apiary.location.longitude
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
        const upgrade = _jsonToObject(upgradeJSON);
        const result = await upgrade.create();
        return result;
    } catch (error) {
        return new Result(-1, null, `Error creating hive upgrade: ${error.message}`);
    }
}

const getUpgrade = async (req, res) => {
    try {
        const result = await HiveUpgrade.get(req.body._id);
        return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error fetching hive upgrade: ${error.message}`).toJSON();
    }
}

const getUpgrades = async (req, res) => {
    try {
        const result = await HiveUpgrade.getAll();
        req.session.upgrades = result.data || [];
        return res.json(result.toJSON());
    } catch (error) {
        return res.json(new Result(-1, null, `Error fetching hive upgrades: ${error.message}`).toJSON());
    }
}

const getSortedUpgrades = async (req, res) => {
    try {
        const sortBy = req.body.sortBy || { createdAt: -1 };
        const limit = req.body.limit || 10;
        const result = await HiveUpgrade.getAll(sortBy, limit);
        req.session.upgrades = result.data || [];
        return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error getting all threats: ${error.message}`).toJSON()
    }
}

const getUpgradesCount = async (req, res) => {
    try {
        const result = await HiveUpgrade.count()
        req.session.stats.upgrades = result.data || 0
        return result.toJSON()
    } catch (error) {
        return new Result(-1, null, `Error fetching upgrade count: ${error.message}`).toJSON()
    }
}

const makeOperational = async (req, res) => {
    try {
        const upgrade = await HiveUpgrade.get(req.body._id);
        if (!upgrade.success.status) return res.json(upgrade.toJSON());
        const hiveUpgrade = _jsonToObject(upgrade.data);
        const result = await hiveUpgrade.makeOperational();
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
            req.session.currentHive = result.data._id;
            req.session.currentHiveIndex = req.body.index || 0;
            req.session.save()

            result = await hive.getThreats();
            if(!result.success.status) return res.json(result);
            for(let i = 0; i < result.data.length; i++){
                hive.threats[i] = controllers.threat._jsonToObject(result.data[i]);
            }

            result = await hive.getReadings();
            if(!result.success.status) return res.json(result);
            for(let i = 0; i < result.data.length; i++){
               hive.readings[i] = controllers.reading._jsonToObject(result.data[i]);
               const sensorType = await hive.readings[i].getSensorType()
               if(!sensorType.success.status) return res.json(sensorType);
               hive.readings[i].sensorType = sensorType.data
               if(!hive.sensors.includes(sensorType.data)) hive.sensors.push(sensorType.data)
            }
            result = await hive.getUpgrades();
            if(!result.success.status) return res.json(result);
            for(let i = 0; i < result.data.length; i++){
                hive.upgrades[i] = _jsonToObject(result.data[i])
                const productName = await hive.upgrades[i].getProductName()
                if(!productName.success.status) return res.json(result);
                hive.upgrades[i].productNames = productName.data

                req.body.name = productName.data
                const productResult = await controllers.product.getProduct(req,res)
                if(!productResult.success.status) return res.json(productResult);
                const product = controllers.product._jsonToObject(productResult.data);
                hive.products.push(product)
            }
            return res.json(new Result(1, hive, "Hive Fetched and Injected with data").toJSON());
        }
        else return res.json(result);
    } catch (error) {
        return res.json(new Result(-1, null, `Error fetching hive: ${error.message}`).toJSON());
    }
}

const sendEmail = async (req, res) => {
    try {
      const formDataWithWeather = {
        ...req.body,
      };
      const emailSent = await sendUpgradeConfirmation(
        req.session.user.email,
        formDataWithWeather
      );
      if (!emailSent) {
        req.session.message = "Please try again";
        return new Result(0, null, "Error sending upgrade email");
      }
      return new Result(1, null, "Upgrade email sent successfully");
    } catch (error) {
      console.error("Upgrade email error:", error);
      return new Result(
        -1,
        null,
        `Error sending upgrade email: ${error.message}`
      );
    }
  };

const addUpgrade = async (req, res) => {
    try {
        req.body._id = req.body.hive
        const hiveResult = await controllers.hive.getHive(req,res)
        if(!hiveResult.success.status) return res.json(hiveResult.toJSON());
        const hive = controllers.hive._jsonToObject(hiveResult.data);

        let products = []
        for(let i =0; i<req.body.productIds.length; i++){
            req.body._id = req.body.productIds[i]
            const productResult = await controllers.product.getProduct(req,res)
            if(!productResult.success.status) return res.json(productResult.toJSON());
            const product = controllers.product._jsonToObject(productResult.data);
            const incrementResult = await product.increment();
            if(!incrementResult.success.status) return res.json(incrementResult.toJSON());
            products.push(product)
            req.body.hiveRef = hive._id;
            req.body.productRef = product._id;
            const upgradeResult = await addHiveUpgrade(req, res);
            if(!upgradeResult.success.status) return res.json(upgradeResult.toJSON());
        }
        return res.json(new Result(1, hive, "Upgrades added successfully").toJSON())

    } catch (error) {
        return res.json(new Result(-1, null, `Error creating hive upgrade: ${error.message}`).toJSON());
    }
}

const removeUpgrade = async (req, res) => {
    try{
        let result = null
        if(req.query._id) result = await HiveUpgrade.get(req.query._id);
        else result = await HiveUpgrade.get(req.body.hiveRef, req.body.productRef);
        if(!result.success.status) return res.json(result.toJSON());
        const upgrade = _jsonToObject(result.data);
         result = await upgrade.remove();
        if(!result.success.status) return res.json(result.toJSON());
        const product = controllers.product._jsonToObject(result.data.productRef);
        result = await product.decrement();
        if(!result.success.status) return res.json(result.toJSON());
        return res.json(new Result(1, null, "Upgrade removed successfully").toJSON())
    }
    catch (error) {
        return res.json(new Result(-1, null, `Error removing hive upgrade: ${error.message}`).toJSON());
    }
}


module.exports = {
    upgrade,
    getUpgrade,
    getUpgrades,
    getSortedUpgrades,
    getUpgradesCount,
    makeOperational,
    sendEmail,
    getUpgradedHive,
    addUpgrade,
    removeUpgrade
}