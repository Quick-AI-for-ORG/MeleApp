from flask import Flask, request, jsonify
import numpy as np
import tensorflow as tf

model = tf.keras.models.load_model("model.keras")  

class_labels = ["Class A", "Class B", "Class C"]  

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        if not data or 'input' not in data:
            return jsonify({"error": "Invalid input format. Send JSON with 'input' key"}), 400
        
        input_data = np.array(data['input'])  
        input_data = np.expand_dims(input_data, axis=0) 

        predictions = model.predict(input_data)
        
        predicted_index = np.argmax(predictions[0]) 
        predicted_class = class_labels[predicted_index]
        confidence = float(predictions[0][predicted_index]) 

        return jsonify({
            "predicted_class": predicted_class,
            "confidence": confidence
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
