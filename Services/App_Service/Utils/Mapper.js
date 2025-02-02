const jsonToObject = (obj, json, extras=null) => {
    for (const key of Object.keys(json)) {
            obj[key] = json[key]; 
    }
    if(extras){
        for (const key of Object.keys(extras)) {
            obj[key] = extras[key]; 
        }
    }
    return obj;
};

module.exports = jsonToObject;