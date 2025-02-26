import random
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from tensorflow.keras.layers import Dense, Input
from tensorflow.keras.models import Sequential
from sklearn.metrics import mean_squared_error
from sklearn.preprocessing import StandardScaler

class vibrationAnomalyDetector():
    def __init__(self, n1=16,n2=8):
        self.n1 = n1
        self.n2 = n2
        encoder = Sequential([
        Input(shape=(1,)), 
        Dense(n1, activation='relu'),
        Dense(n2, activation='relu')
        ])

        
        decoder = Sequential([
        Input(shape=(n2,)),
        Dense(n1, activation='relu'),  
        Dense(1, activation='linear')                    
        ])
        
        self.model = Sequential([encoder, decoder])
        self.model.compile(optimizer='adam', loss='mean_squared_error')
        
    def normalize(self,data,test):
        normalizer = StandardScaler()
        xTrain = normalizer.fit_transform(data.values.reshape(-1,1))
        xTest = normalizer.transform(test.values.reshape(-1,1))
        return xTrain, xTest
    
    def train(self,data,epochs=100):
        self.model.fit(data,data,epochs=epochs, shuffle = True, batch_size=32, validation_split=0.2, verbose=0)
    def test(self,data,threshold = 85):
        errors = []
        anomalies = []
        data = np.array(data).reshape(-1, 1)
        predictions = self.model.predict(data)
        for i in range(len(data)):
            mse = mean_squared_error([data[i]], [predictions[i]])
            errors.append(mse)
        
        threshold =  np.percentile(errors, threshold)  
        for i in range(len(data)):
            if errors[i] >= threshold:
                anomalies.append(f"Anomaly Detected for entry: {data[i][0]:.4f} with Mean Squared Error (MSE): {errors[i]:.4f}")
        return predictions, errors, threshold, anomalies