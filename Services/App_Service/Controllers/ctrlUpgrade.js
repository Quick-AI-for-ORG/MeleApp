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
    console.log("Starting upgrade process for user:", req.session.user.email);
    try {
        console.log("Upgrade request body:", JSON.stringify(req.body, null, 2));
        
        const user = controllers.user._jsonToObject(req.session.user);
        console.log("User object created successfully:", user._id);
        
        const apiaries = await controllers.user.getApiaries(req, res);
        console.log("Retrieved apiaries:", apiaries.data?.length || 0);
        
        const newApiary = !req.session.user.apiaries.some(apiary => apiary.name === req.body.apiaryName);
        console.log("Creating new apiary:", newApiary, "Name:", req.body.apiaryName);
        
        let apiary = null;
        if (newApiary) {
            console.log("Setting up new apiary with owner:", user._id);
            req.body.owner = user._id;
            const result = await controllers.apiary.addApiary(req, res);
            console.log("Add apiary result:", result.success.status, result.success.message);
            
            if (result.success.status) {
                apiary = result.data;
                console.log("New apiary created successfully:", apiary._id);
            } else {
                console.error("Failed to create new apiary:", result.success.message);
                return res.json(result.toJSON());
            }
        } else {
            console.log("Using existing apiary:", req.body.apiaryName);
            apiary = apiaries.data.find(apiary => apiary.name === req.body.apiaryName);
            
            if (!apiary) {
                console.error("Could not find existing apiary:", req.body.apiaryName);
                return res.json(new Result(-1, null, `Error fetching apiary: Apiary not found`).toJSON());
            }
            console.log("Found existing apiary:", apiary._id);
        }

        console.log("Creating", req.body.hivesCount, "hives for apiary:", apiary._id);
        let hives = [];
        for (let i = 0; i < req.body.numberOfHives; i++) {
            console.log(`Creating hive ${i+1}/${req.body.hivesCount}`);
            req.body.apiaryRef = apiary._id;
            const result = await controllers.hive.addHive(req, res);
            
            if (!result.success.status) {
                console.error(`Failed to create hive ${i+1}:`, result.success.message);
                return res.json(result.toJSON());
            } else {
                const hive = controllers.hive._jsonToObject(result.data);
                hives.push(hive);
                console.log(`Hive ${i+1} created successfully:`, hive._id);
            }
        }
        console.log("All hives created successfully:", hives.length, "hives");

        console.log("Processing kit selections:", req.body.kitSelection);
        let products = [];
        req.body.kitSelection.forEach(async (productName, i) => {
            console.log(`Processing product ${i+1}/${req.body.kitSelection.length}:`, productName);
            req.body.name = productName;
            const result = await controllers.product.getProduct(req, res);
            
            if (!result.success.status) {
                console.error(`Failed to get product ${productName}:`, result.success.message);
                return res.json(result.toJSON());
            } else {
                console.log(`Product ${productName} retrieved successfully`);
                let product = controllers.product._jsonToObject(result.data);
                console.log(`Incrementing product ${product._id} count`);
                
                const incrementResult = await product.increment();
                if (!incrementResult.success.status) {
                    console.error(`Failed to increment product ${productName}:`, incrementResult.success.message);
                    return res.json(incrementResult.toJSON());
                }
                
                products.push(product);
                console.log(`Product ${productName} incremented successfully`);
                
                console.log(`Creating upgrades for ${hives.length} hives with product ${product._id}`);
                hives.forEach(async (hive, j) => {
                    console.log(`Creating upgrade for hive ${j+1} (${hive._id}) with product ${product._id}`);
                    req.body.hiveRef = hive._id;
                    req.body.productRef = product._id;
                    const upgradeResult = await addHiveUpgrade(req, res);
                    
                    if (!upgradeResult.success.status) {
                        console.error(`Failed to create upgrade for hive ${hive._id}:`, upgradeResult.success.message);
                        return res.json(upgradeResult.toJSON());
                    }
                    console.log(`Upgrade for hive ${hive._id} created successfully`);
                });
            }
        });
        
        console.log("All products processed, sending confirmation email");
        // const emailResult = await sendEmail(req, res);
        // if (!emailResult.success.status) {
        //     console.error("Failed to send confirmation email:", emailResult.success.message);
        //     return res.json(emailResult.toJSON());
        // }
        // console.log("Email sent successfully, redirecting to keeper dashboard");
        
        res.redirect('/keeper');
    } catch (error) {
        console.error("Upgrade process failed with exception:", error);
        console.error("Error stack trace:", error.stack);
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
        const upgrade = hiveUpgrade(upgradeJSON);
        const result = await upgrade.create();
        return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error creating hive upgrade: ${error.message}`).toJSON();
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