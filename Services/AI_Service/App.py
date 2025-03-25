from flask import Flask, request, jsonify, Response
import cv2
import numpy as np
import tensorflow as tf
import os
import sys
import base64
sys.path.append(os.path.join(os.path.dirname('Utils')))
sys.path.append(os.path.join(os.path.dirname('../Shared')))
from Shared.Result import Result
from Utils.insectClassifier import insectClassifier
from Utils.tempForecast import tempForecast
from Utils.vibrationAnomaly import vibrationAnomalyDetector
from Utils.honeyInspector import honeyInspector


forecastPath = "Models/arimaModel.joblib"
inspectorPath = "Models/Honeycomb.pt"

forecaster = tempForecast(forecastPath)
honeyInspector = honeyInspector(inspectorPath,0.3)
anomalyDetector = vibrationAnomalyDetector()

app = Flask(__name__)

    
@app.route('/forecast', methods=['POST'])
def forecast():
        try:
            data = request.get_json()
            if not data or 'dates' not in data or 'temps' not in data:
                return jsonify({"error": "Invalid input format."}), 400
            
            dates = data['dates']
            temps = data['temps']
            data = forecaster.loadAndPreprocessData(dates, temps,'D')
            model = forecaster.trainArimaModel(data)
            forecasted = forecaster.generateForecast(model,10)
            forecasted = forecasted.tolist()
            return jsonify({
                "forecast": forecasted
            })
        
        except Exception as e:
            return jsonify({"error": str(e),"data":f"{dates},{temps}"}), 500

@app.route('/honeyInspect',methods=['POST'])
def honeyInspect():
    try:
        file = request.files['image']
        image = np.frombuffer(file.read(), np.uint8)
        image = cv2.imdecode(image,cv2.IMREAD_COLOR)
        labels, frame = honeyInspector.inspect(image)
        _, buffer = cv2.imencode('.jpg', frame)
        encodedImage = base64.b64encode(buffer).decode('utf-8')
        return jsonify({
            "labels":labels,
            "frame":encodedImage
                        })
    except Exception as e:
        return jsonify({"error":str(e)})

@app.route('/normal', methods=['POST'])
def fitNormal():
    try:
        data = request.get_json()
        data = np.array(data["vibrationReadings"])
        anomalyDetector.train( data , 5)
        return jsonify({"status":"Sucessfully trained"})
    except Exception as e:
        return jsonify({"error":str(e)})

@app.route("/anomaly",methods=["POST"])
def detectAnomaly():
    try:
        data = request.get_json()
        data = np.array(data["vibrationReadings"])
        predictions, errors, threshold, anomalies = anomalyDetector.test(data,75)
        return jsonify({"anomalies":anomalies})
    except Exception as e:
        return jsonify({"error":str(e)})



@app.route('/plotting', methods=['GET'])
def plot():
    anomalyDetector.plotErrors()
    anomalyDetector.plotReconstructedData()
    return jsonify({"status":"Plotted"})
if __name__ == '__main__':
    app.run(debug=True)
