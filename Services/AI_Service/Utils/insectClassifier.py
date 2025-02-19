import cv2
import numpy as np
from ultralytics import YOLO
from tensorflow.lite.python.interpreter import Interpreter

yoloPath = '../Models/Insect.pt'  
beePath = '../Models/quantizedBee.tflite'
waspPath = '../Models/quantizedWasp.tflite'

class insectClassifier:
    def __init__(self,beePath,waspPath,yoloPath,yoloThreshold=0.3,classifierThreshold=0.8,waspThreshold=5,inputSize=(224,224),skipFrames=1):
        self.yoloModel = YOLO(yoloPath)
        self.beeModel = Interpreter(beePath)
        self.beeModel.allocate_tensors()
        self.waspModel = Interpreter(waspPath)
        self.waspModel.allocate_tensors()
        self.yoloThreshold = yoloThreshold
        self.classifierThreshold = classifierThreshold
        self.inputSize = inputSize
        self.skipFrames = skipFrames
        self.frameCounter = 0
        self.waspCounter = 0
        self.waspThreshold = waspThreshold
    
    def detectInsect(self,frame):
        detections = self.yoloModel.track(source=frame, conf=self.yoloThreshold, verbose=False,persist=True)
        return detections
    
    def quantizedClassify(self,interpreter, inputData):
        inputData = np.array(inputData,dtype=np.float32)
        interpreter.set_tensor(interpreter.get_input_details()[0]['index'], inputData)
        interpreter.invoke()
        return interpreter.get_tensor((interpreter.get_output_details()[0]['index']))
    
    def classifyInsect(self,yoloDetections,frame):   
        colors = {'Bee':(0,255,0),
               'Wasp':(0,0,255),
               'Other':(255,0,0)
               } 
        waspBool = False
        for detection in yoloDetections:
            boxes = detection.boxes.xyxy.cpu().numpy()
            yolo_confidences = detection.boxes.conf.cpu().numpy()
            for i,box in enumerate(boxes):
                
                x1, y1, x2, y2 = map(int , box)
                
                x1,y1 = max(0,x1),max(0,y1)
                x2, y2 = min(x2, frame.shape[1] - 1), min(y2, frame.shape[0] - 1)

                if x2 > x1 and y2 > y1:
                    cropped_region = frame[y1:y2, x1:x2]
                    
                    cropped_input = cv2.resize(cropped_region, self.inputSize)
                    cropped_input = np.expand_dims(cropped_input, axis=0)  
                    
                    bee_score = np.max(self.quantizedClassify(self.beeModel,cropped_input))
                    wasp_score = np.max(self.quantizedClassify(self.waspModel,cropped_input))
                    
                    
                    if (bee_score < self.classifierThreshold and  wasp_score < self.classifierThreshold):
                        predicted_class = "Other"
                        confidence_score = 1.0 - (bee_score + wasp_score)/2.0                    
                       
                    else:
                        if bee_score > wasp_score:
                            predicted_class = 'Bee'
                            confidence_score = bee_score 
                        else:
                            predicted_class = 'Wasp'
                            confidence_score = wasp_score
                            waspBool = True
                    
                        
                    label = f"Class {predicted_class} ({confidence_score:.2f}, Insect {yolo_confidences[i]:.2f})"
                    cv2.rectangle(frame, (x1, y1), (x2, y2), colors[predicted_class], 2)
                    cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, colors[predicted_class], 2)
        return frame,waspBool
    
    def processFrameNoskip(self, frame):
        yoloDetections = self.detectInsect(frame)
        return self.classifyInsect(yoloDetections,frame)
    def processFrame(self, frame):
        self.frameCounter += 1
        if self.frameCounter % self.skipFrames == 0:
            yoloDetections = self.detectInsect(frame)
            frame, waspBool = self.classifyInsect(yoloDetections,frame)
            if waspBool == True:
                self.waspCounter += 1
                print(self.waspCounter)
                if self.waspCounter == self.waspThreshold:
                    print('DANGER: WASP detected CLOSING DOOR !!')
                    self.waspCounter = 0
            else: self.waspCounter = 0
        return frame