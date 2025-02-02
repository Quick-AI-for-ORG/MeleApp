class User {
    constructor(userJSON) {
        this.name = userJSON.name;
        this.role = userJSON.role;
        this.email = userJSON.email;
        this.password = userJSON.password;
        this.tel = userJSON.tel;
        this.address = userJSON.address;
        this.affiliation = userJSON.affiliation;
    }
}