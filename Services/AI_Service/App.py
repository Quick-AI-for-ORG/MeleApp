from flask import Flask, request, jsonify, Response, render_template
import cv2
import numpy as np
import os
import sys
import base64
sys.path.append(os.path.join(os.path.dirname('Utils')))
sys.path.append(os.path.join(os.path.dirname('../Shared')))
from Shared.Result import Result
from Utils.weatherForecast import WeatherForecast
from Utils.vibrationAnomaly import vibrationAnomalyDetector
from Utils.honeyInspector import honeyInspector

from dotenv import load_dotenv
load_dotenv(dotenv_path="../../.env")

inspectorPath = "Models/Honeycomb.pt"

forecaster = WeatherForecast()
honeyInspector = honeyInspector(inspectorPath,0.3)
anomalyDetector = vibrationAnomalyDetector()

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

        
@app.route('/forecast', methods=['POST'])
def forecast():
        try:
            data = request.get_json()
            if not data: return jsonify(Result(0, None, "No data provided").to_json()), 400
            
            proccessed = forecaster.loadAndPreprocessData(data["sensorType"] ,data["readings"], data["freq"], data["append"])
            forecaster.trainArimaModel(data["sensorType"], proccessed, data["append"], data["checkPerformance"])
            forecasted = forecaster.generateForecast(data["sensorType"], data["steps"])
            toReturn = {
                "sensorType": data["sensorType"],
                "forecasts": {str(key): value for key, value in forecasted.items()}
            }
            
            if data["checkPerformance"]: toReturn["metrics"] =  forecaster.metrics
            if data["getImage"]: toReturn["image"] = forecaster.plotForecastsVsActual(proccessed.index, proccessed.values, forecasted, data["sensorType"]).tolist()
            
            return jsonify(
                Result(1, toReturn, f"Forecasted Data Successfully for {len(data["readings"])} {data["sensorType"]} Readings").to_json()
            )
        
        except ValueError as ve: 
            return jsonify(Result(-1, None, str(ve)).to_json()), 400
    
        except Exception as e:
            return jsonify(Result(-1,None, str(e))), 500

@app.route('/honeyInspect',methods=['POST'])
def honeyInspect():
    try:
        data = request.get_json()
        image = data.get('image')
        binary = bytes(image['data'])   
        image = np.frombuffer(binary, np.uint8)        
        image = cv2.imdecode(image, cv2.IMREAD_COLOR)
        labels, frame = honeyInspector.inspect(image)
        _, buffer = cv2.imencode('.jpg', frame)
        encodedImage = base64.b64encode(buffer).decode('utf-8')
        return jsonify(Result(1,{
            "labels":labels,
            "frame":encodedImage
                        }, "Predictions fetched sucessfully").to_json())
    except Exception as e:
        return jsonify(Result(-1, None, f"Error predicting:  {str(e)}").to_json())

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
    try:
        print(f"Flask Server is running on {os.getenv('IP')}:{os.getenv('FLASK_PORT')}")
        from waitress import serve
        serve(app, host=os.getenv('IP'), port=os.getenv('FLASK_PORT'))
        
    except KeyboardInterrupt:
        print("\n[INFO] Keyboard interrupt received. Shutting down server gracefully...")
        sys.exit(0)
