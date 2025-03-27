import os
import cv2
import time
import threading
import numpy as np
import RPi.GPIO as GPIO
from ultralytics import YOLO
from tensorflow import keras
from picamera2 import Picamera2

os.environ["QT_QPA_PLATFORM"] = "xcb"
from tensorflow.lite.python.interpreter import Interpreter

# replace these with actual paths on pi
yoloPath = "../Models/Insect.pt"
beePath = "../Models/quantizedBee.tflite"
waspPath = "../Models/quantizedWasp.tflite"

# make sure right pin is connected
servoPin = 23
GPIO.setmode(GPIO.BCM)
GPIO.setup(servoPin, GPIO.OUT)
pwm = GPIO.PWM(servoPin, 50)
pwm.start(0)


def setServoAngle(angle):
    duty_cycle = (angle / 18) + 2
    pwm.ChangeDutyCycle(duty_cycle)


class insectClassifier:
    def __init__(
        self,
        beePath,
        waspPath,
        yoloPath,
        yoloThreshold=0.3,
        classifierThreshold=0.8,
        waspThreshold=4,
        inputSize=(224, 224),
        skipFrames=1,
        threadNum=16,
    ):
        self.yoloModel = YOLO(yoloPath)
        self.beeModel = Interpreter(beePath)
        self.beeModel.allocate_tensors()
        self.waspModel = Interpreter(waspPath)
        self.waspModel.allocate_tensors()
        self.yoloThreshold = yoloThreshold
        self.doorClosed = False
        self.classifierThreshold = classifierThreshold
        self.inputSize = inputSize
        self.skipFrames = skipFrames
        self.frameCounter = 0
        self.waspCounter = 0
        self.waspThreshold = waspThreshold
        self.colors = {"Bee": (0, 255, 0), "Wasp": (0, 0, 255), "Other": (255, 0, 0)}
        self.beeModels = []
        self.waspModels = []
        self.beeLocks = []
        self.waspLocks = []
        self.threadNum = threadNum
        self.lock = threading.Lock()

        for i in range(self.threadNum):
            beeModel = Interpreter(beePath)
            beeModel.allocate_tensors()
            waspModel = Interpreter(waspPath)
            waspModel.allocate_tensors()
            beeLock = threading.Lock()
            waspLock = threading.Lock()
            self.beeModels.append(beeModel)
            self.waspModels.append(waspModel)
            self.beeLocks.append(beeLock)
            self.waspLocks.append(waspLock)

    def detectInsect(self, frame):
        detections = self.yoloModel.predict(
            source=frame, conf=self.yoloThreshold, verbose=False
        )
        return detections

    def quantizedClassify(self, interpreter, inputData):
        inputData = np.array(inputData, dtype=np.float32)
        interpreter.set_tensor(interpreter.get_input_details()[0]["index"], inputData)
        interpreter.invoke()
        return interpreter.get_tensor((interpreter.get_output_details()[0]["index"]))

    def classifyBox(self, frame, box, yolo_confidence, waspBool, i):
        try:
            x1, y1, x2, y2 = map(int, box)

            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(x2, frame.shape[1] - 1), min(y2, frame.shape[0] - 1)

            if x2 > x1 and y2 > y1:
                croppedRegion = frame[y1:y2, x1:x2]

                croppedInput = cv2.resize(croppedRegion, self.inputSize)
                croppedInput = np.expand_dims(croppedInput, axis=0)

                with self.beeLocks[i % self.threadNum]:
                    beeScore = np.max(
                        self.quantizedClassify(
                            self.beeModels[i % self.threadNum], croppedInput
                        )
                    )

                with self.waspLocks[i % self.threadNum]:
                    waspScore = np.max(
                        self.quantizedClassify(
                            self.waspModels[i % self.threadNum], croppedInput
                        )
                    )

                if (
                    beeScore < self.classifierThreshold
                    and waspScore < self.classifierThreshold
                ):
                    predictedClass = "Other"
                    confidenceScore = 1.0 - (beeScore + waspScore) / 2.0

                else:
                    if beeScore > waspScore:
                        predictedClass = "Bee"
                        confidenceScore = beeScore
                    else:
                        predictedClass = "Wasp"
                        confidenceScore = waspScore
                        waspBool[0] = True

                    label = f"Class {predictedClass} ({confidenceScore:.2f}, Insect {yolo_confidence:.2f})"
                    cv2.rectangle(
                        frame, (x1, y1), (x2, y2), self.colors[predictedClass], 2
                    )
                    cv2.putText(
                        frame,
                        label,
                        (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.5,
                        self.colors[predictedClass],
                        2,
                    )
            return frame, waspBool
        except Exception as e:
            print(e)

    def classify_insect(self, yolo_detections, frame):
        waspBool = [False]
        threads = []
        for detection in yolo_detections:
            boxes = detection.boxes.xyxy.cpu().numpy()
            yoloConfidences = detection.boxes.conf.cpu().numpy()

            for i in range(len(boxes)):
                thread = threading.Thread(
                    target=self.classifyBox,
                    args=(frame, boxes[i], yoloConfidences[i], waspBool, i),
                )
                threads.append(thread)
                thread.start()
            for thread in threads:
                thread.join()
        return frame, waspBool

    def closeDoor(self):
        if self.doorClosed == False:
            print("DANGER: WASP DETECTED CLOSING DOOR !!")
            setServoAngle(180)
            self.doorClosed = True
        else:
            print("DANGER: WASP DETECTED DOOR WILL REMAIN CLOSED")

    def openDoor(self):
        if self.doorClosed == True:
            print("MANUAL OVERRIDE TRIGGERED: OPENING DOOR")
            setServoAngle(0)
            self.doorClosed = False
        else:
            print("DOOR IS ALREADY OPEN")

    def processFrame(self, frame):
        self.frameCounter += 1
        if self.frameCounter % self.skipFrames == 0:
            yoloDetections = self.detectInsect(frame)
            frame, waspBool = self.classify_insect(yoloDetections, frame)
            if waspBool[0] == True:
                self.waspCounter += 1
                print(self.waspCounter)
                if self.waspCounter == self.waspThreshold:
                    self.closeDoor()
                    self.waspCounter = 0
            else:
                self.waspCounter = 0
        return frame


if __name__ == "__main__":

    classifier = insectClassifier(
        beePath, waspPath, yoloPath, threadNum=4, skipFrames=1
    )

    picam2 = Picamera2()
    previewConfig = picam2.create_preview_configuration(
        main={"format": "BGR888", "size": (640, 480)}
    )
    picam2.configure(previewConfig)

    try:
        picam2.start()
    except Exception as e:
        print(f"Error: Could not start camera. {e}")
        exit()

    windowName = "YOLOResNet insect detection and classification"
    cv2.namedWindow(windowName, cv2.WINDOW_NORMAL)
    cv2.resizeWindow(windowName, 800, 600)

    while True:
        inputFrame = picam2.capture_array()

        if inputFrame is None or inputFrame.size == 0:
            print("Error: Invalid frame captured")
            break

        inputFrame = np.array(inputFrame, dtype=np.uint8)
        # frame = cv2.cvtColor(inputFrame, cv2.COLOR_BGRA2BGR)
        annotatedFrame = classifier.processFrame(inputFrame)
        cv2.imshow(windowName, np.array(annotatedFrame))
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    picam2.stop()
    cv2.destroyAllWindows()
    pwm.stop()
    GPIO.cleanup()
