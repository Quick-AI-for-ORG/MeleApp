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


beePath = "Models/quantizedBee.tflite"
waspPath = "Models/quantizedWasp.tflite"
yoloPath = "Models/Insect.pt"
forecastPath = "Models/arimaModel.joblib"
inspectorPath = "Models/Honeycomb.pt"

classifier = insectClassifier(beePath,waspPath,yoloPath)
forecaster = tempForecast(forecastPath)
honeyInspector = honeyInspector(inspectorPath,0.3)
anomalyDetector = vibrationAnomalyDetector()

app = Flask(__name__)

@app.route('/classifyInsect', methods=['POST'])
def classifyInsect():
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
#     try:
#         data = request.get_json()
#         if not data or 'input' not in data:
#             return jsonify({"error": "Invalid input format. Send JSON with 'input' key"}), 400
        
#         input_data = np.array(data['input'])
#         input_data = np.expand_dims(input_data, axis=0)
#         result = anomaly.forecast(input_data)
#         return jsonify({"result": result})
    
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
