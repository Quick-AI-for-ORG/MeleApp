const crudInterface = require('../Utils/CRUD');
const jsonToObject = require('../Utils/Mapper');

const bcrypt = require('bcrypt')
const HASH_SALT = 12;

class User {
    static crudInterface = crudInterface;
    static jsonToObject = jsonToObject;   
    constructor(userJSON, role="Owner", hashing=false) {
        if(hashing) userJSON.password = User.hashPassword(userJSON.password)
        User.jsonToObject(this, userJSON, {role: role});
    }
      static hashPassword(password) {
        return bcrypt.hash(password, HASH_SALT);
      }
      async create(){ 
        await User.crudInterface.create(this,"userModel","email") 
      }
      async modify(newUser){
         const user = await User.crudInterface.modify(this.email,newUser,"userModel","email") 
         this.jsonToObject(user,user.role)
      }
      async remove(){
         await User.crudInterface.remove(this.email,"userModel","email") 
         return null;
      }
      static async remove(email){
        await User.crudInterface.remove(email,"userModel","email") 
        return null;
     }
      static async get(email){
        const user = await User.crudInterface.get(email,"userModel","email")
        if(user) return new User(user,user.role) 
        else return null
      }
      static async getAll(){
        const records = await User.crudInterface.getAll("userModel") 
        let users = []
        if(records.length > 0){
        for(let i = 0; i < records.length; i++){
          users.push(new User(records[i],records[i].role))
        }
        return users
      }
      return null
    }
      static async login(email, password) {
            const user = await User.get(email);
            if (!user) {
              console.log('User not found');
              return null
            }
            if(password != null){
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
             console.log('Incorrect password');
             return null
            }
          }
            return new User(user,user.role)
          }
    }
  
    module.exports = User