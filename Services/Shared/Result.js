class Result {
    constructor(int, data = null, message = null) {
        this.success = Result.mapInt(int);
        this.data = data;
        this.message = message || Result.defaultMessages(int);
    }

    static mapInt(int) {
        if (int === 1) {
            return{
                status: true,
                type: "Success"
            }
        } else if (int === 0) {
            return {
                status: false,
                type: "Failure"
            }
        } else {
            return {
                status: false,
                type: "Error"
            }
        }
    }

    static defaultMessages(int) {
        switch (int) {
            case 1:
                return "Succeeded Executing Transaction.";
            case 0:
                return "Failed Executing Transaction.";
            default:
                return "Error Executing Transaction.";
        }
    }

    static success(data, message = null) {
        return new Result(1, data, message);
    }

    static fail(message = null) {
        return new Result(0, null, message);
    }

    static error(message = null) {
        return new Result(-1, null, message);
    }

    toString() {
        return `${this.success.type} : ${this.message}`;
    }

    toJSON() {
        return {
            success: this.success,
            data: this.data,
            message: this.message
        };
    }
}

module.exports = Result;
