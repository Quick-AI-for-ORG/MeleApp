from flask import Flask, request, jsonify, Response
import cv2
import numpy as np
import tensorflow as tf
import os
import sys
sys.path.append(os.path.join(os.path.dirname('Utils')))
from Utils.Insect_Classifier import insectClassifier

beePath = "../AI_Service/Models/Quantized_Bee.tflite"
waspPath = "../AI_Service/Models/Quantized_Wasp.tflite"
yoloPath = "../AI_Service/Models/Insect.pt"

classifier = insectClassifier(beePath,waspPath,yoloPath)

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

if __name__ == '__main__':
    app.run(debug=True)
