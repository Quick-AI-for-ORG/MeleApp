import numpy as np
import pandas as pd
import joblib
import matplotlib.pyplot as plt
from statsmodels.tsa.arima.model import ARIMA
from sklearn.metrics import mean_squared_error, mean_absolute_error

class vibrationAnomaly:
    def __init__(self, modelPath):
        self.model = joblib.load(modelPath)
    
    @staticmethod
    def loadAndPreprocessData(inputData):
        data = pd.read_csv(inputData)
        data['Date_Time'] = pd.to_datetime(data['Date_Time'])
        data = data.drop_duplicates(subset='Date_Time').sort_values(by='Date_Time').reset_index(drop=True)
        data = data.set_index('Date_Time').asfreq('D')
        data = data.interpolate(method='time')  
        return data
    
    @staticmethod
    def splitData(data, targetColumn, splitRatio=0.8):
        splitIndex = int(len(data) * splitRatio)
        trainData = data.iloc[:splitIndex][targetColumn]
        testData = data.iloc[splitIndex:][targetColumn]
        return trainData, testData
    
    @staticmethod
    def trainArimaModel(trainData, order=(1, 1, 1)):
        model = ARIMA(trainData, order=order)
        modelFit = model.fit()
        return modelFit
    
    @staticmethod
    def generateForecast(model, steps):
        forecast = model.forecast(steps=steps)
        return forecast
    
    @staticmethod
    def smape(actual, forecast):
        actual = np.array(actual)
        forecast = np.array(forecast)
        numerator = np.abs(forecast - actual)
        denominator = (np.abs(actual) + np.abs(forecast)) / 2
        return 100 * np.mean(numerator / denominator)
    
    @staticmethod
    def printMetrics(actual, forecast, modelName="ARIMA"):
        mse = mean_squared_error(actual, forecast)
        mad = mean_absolute_error(actual, forecast)
        smapeVal = vibrationForecast.smape(actual, forecast)
        
        print(f"\nMetrics for {modelName}:")
        print(f"\tMean Squared Error (MSE): {mse:.5f}")
        print(f"\tMean Absolute Deviation (MAD): {mad:.5f}")
        print(f"\tRoot Mean Squared Error (RMSE): {np.sqrt(mse):.5f}")
        print(f"\tSymmetric Mean Absolute Percentage Error (SMAPE): {smapeVal:.5f}")
    
    @staticmethod
    def plotForecastsVsActual(dates, actual, forecasted, modelName="ARIMA"):
       
        plt.figure(figsize=(10, 5))
        plt.plot(dates, actual, marker='o', linestyle='-', label='Actual Vibration')
        plt.plot(dates, forecasted, marker='o', linestyle='-', label='Forecasted Vibration')
        plt.title(f'Actual vs Forecasted Vibrations using {modelName}')
        plt.xlabel('Date')
        plt.ylabel('Vibration')
        plt.xticks(rotation=45)
        plt.legend()
        plt.tight_layout()
        plt.show()
