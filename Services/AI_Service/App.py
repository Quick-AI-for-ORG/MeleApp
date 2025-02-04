from flask import Flask, request, jsonify, Response
import cv2
import numpy as np
import tensorflow as tf
import os
import sys
sys.path.append(os.path.join(os.path.dirname('Utils')))
sys.path.append(os.path.join(os.path.dirname('../Shared')))
from Shared.Result import Result
from Utils.insectClassifier import insectClassifier
from Utils.tempForecast import tempForecast
from Utils.vibrationAnomaly import vibrationAnomaly

beePath = "Models/Quantized_Bee.tflite"
waspPath = "Models/Quantized_Wasp.tflite"
yoloPath = "Models/Insect.pt"
forecastPath = "Models/arimaModel.joblib"
anomalyPath = "Models/vibration_classifier.pkl"

classifier = insectClassifier(beePath,waspPath,yoloPath)
forecaster = tempForecast(forecastPath)
anomaly = vibrationAnomaly(anomalyPath)

app = Flask(__name__)

@app.route('/Classify', methods=['POST'])
def classify():
    try:
        data = request.json
        if not data or 'input' not in data:
            return jsonify({"error": "Invalid input format. Send JSON with 'input' key"}), 400
        
        input_data = np.array(data['input'])  
        input_data = np.expand_dims(input_data, axis=0) 
        
        frame = classifier.processFrame(input_data)

        return jsonify({
            frame: frame
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/Forecast', methods=['POST'])
def forecast():
        try:
            data = request.json
            if not data or 'input' not in data:
                return jsonify({"error": "Invalid input format. Send JSON with 'input' key"}), 400
            
            input_data = data['input']
            data = forecaster.loadAndPreprocessData(input_data)
            trainData, testData = forecaster.splitData(data, 'Temperature')
            model = forecaster.trainArimaModel(trainData)
            forecast = forecaster.generateForecast(model, len(testData))
            
            return jsonify({
                "forecast": forecast
            })
        
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@app.route('/anomaly', methods=['POST'])
def anomaly():
    try:
        data = request.get_json()
        if not data or 'input' not in data:
            return jsonify({"error": "Invalid input format. Send JSON with 'input' key"}), 400
        
        input_data = np.array(data['input'])
        input_data = np.expand_dims(input_data, axis=0)
        result = anomaly.forecast(input_data)
        return jsonify({"result": result})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
if __name__ == '__main__':
    app.run(debug=True)
