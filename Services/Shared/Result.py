class Result:
    def __init__(self, int_value, data=None, message=None):
        self.success = self.map_int(int_value)
        self.data = data
        self.message = message or self.default_messages(int_value)

    @staticmethod
    def map_int(int_value):
        if int_value == 1:
            return {"status": True, "type": "Success"}
        elif int_value == 0:
            return {"status": False, "type": "Failure"}
        else:
            return {"status": False, "type": "Error"}

    @staticmethod
    def default_messages(int_value):
        if int_value == 1:
            return "Succeeded Executing Transaction."
        elif int_value == 0:
            return "Failed Executing Transaction."
        else:
            return "Error Executing Transaction."

    @classmethod
    def success(cls, data=None, message=None):
        return cls(1, data, message)

    @classmethod
    def fail(cls, message=None):
        return cls(0, None, message)

    @classmethod
    def error(cls, message=None):
        return cls(-1, None, message)

    def __str__(self):
        return f"{self.success['type']} : {self.message}"

    def to_json(self):
        return {
            "success": self.success,
            "data": self.data,
            "message": self.message
        }
