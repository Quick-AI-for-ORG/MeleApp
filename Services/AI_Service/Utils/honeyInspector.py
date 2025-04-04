import cv2
import numpy as np
from ultralytics import YOLO

path = "../Models/Honeycomb.pt"

class honeyInspector:
    def __init__(self, path, threshold=0.3):
        self.model = YOLO(path)
        self.threshold = threshold
    def  inspect(self,frame):
        try:
            results = self.model.predict(source=frame, conf=self.threshold,verbose = False)
        except Exception as e:
            print("Error during prediction:", e)
            return [], frame
        print(results)
        detections = results[0].boxes.data.cpu().numpy()
        classCounts = {}
        for detection in detections:
            classId = int(detection[5])
            classCounts[classId] = classCounts.get(classId,0)+1
        annotatedFrame = results[0].plot()
        yOffset = 20
        texts = []
        for class_id, count in classCounts.items():
            class_name = self.model.names[class_id]  
            text = f"{class_name}: {count}"
            texts.append(text)
            cv2.putText(
                annotatedFrame,
                text,
                (10, yOffset),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2,
                cv2.LINE_AA,
            )
            yOffset += 30
        return texts, annotatedFrame