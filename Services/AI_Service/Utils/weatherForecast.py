
import io
import warnings
import numpy as np
import pandas as pd
from PIL import Image
import matplotlib.pyplot as plt
from pmdarima import auto_arima
from statsmodels.tsa.arima.model import ARIMA
from sklearn.metrics import mean_squared_error, mean_absolute_error

class WeatherForecast:
    def __init__(self):
        self.model = {
            "Temperature": None,
            "Humidity": None
        }
        self.orders = {
            "Temperature": (1,1,1),
            "Humidity": (1,1,1)
        }
        self.lastTrainDate = None
        self.trainData = {
            "Temperature": None,
            "Humidity": None
        }
        self.freq = "T"
        self.maxHistory = pd.Timedelta(days=2)
        self.metrics = {}

    def loadAndPreprocessData(self, inputType, readings, freq="T", update=False):
        if not readings:
            raise ValueError("No readings provided")
        
        if not update:
            self.freq = freq
        
        data = pd.DataFrame([
            {
                "dateTime": reading.get("createdAt"),
                inputType: float(reading.get("sensorValue"))
            }
            for reading in readings
        ])
        
    
        data['dateTime'] = pd.to_datetime(data['dateTime'])
        data = data.drop_duplicates(subset='dateTime').sort_values(by='dateTime').reset_index(drop=True)
        data = data.set_index('dateTime')
        data = data.interpolate(method='time')
        
        if not update and len(data) < 3:
            raise ValueError("Not enough data points for forecasting")
        
        return data
    
    def findBestOrder(self, data, sensorType):
        auto = auto_arima(data, start_p=0, start_q=0, max_p=2, max_q=2, m=1, start_P=0, seasonal=False, d=None, max_d=2, 
                                trace=False,
                                error_action='ignore',
                                suppress_warnings=True,
                                stepwise=True)
        
        bestOrder = auto.order
        self.orders[sensorType] = bestOrder
        return bestOrder

    def trainArimaModel(self, sensorType, trainData, update=False, evaluate=False):
        if isinstance(trainData, pd.DataFrame):
            trainData = trainData[sensorType]
        
        if not update and len(trainData) < 3:
            raise ValueError("Not enough data points for ARIMA model")
        
        if update and self.trainData[sensorType] is not None:
            self.trainData[sensorType] = pd.concat([self.trainData[sensorType], trainData])
            self.trainData[sensorType] = self.trainData[sensorType].sort_index().drop_duplicates()
            
            cutoffDate = self.trainData[sensorType].index[-1] - self.maxHistory
            self.trainData[sensorType] = self.trainData[sensorType][self.trainData[sensorType].index > cutoffDate]
            
            trainingData = self.trainData[sensorType]
        else:
            self.trainData[sensorType] = trainData
            cutoffDate = trainData.index[-1] - self.maxHistory
            self.trainData[sensorType] = self.trainData[sensorType][self.trainData[sensorType].index > cutoffDate]
            trainingData = self.trainData[sensorType]
            
            self.orders[sensorType] = self.findBestOrder(trainingData, sensorType)

        self.lastTrainDate = trainingData.index[-1]
        
        with warnings.catch_warnings():
            warnings.filterwarnings("ignore")
            if evaluate: self.evaluateModel(trainingData, sensorType)
            self.model[sensorType] = ARIMA(trainingData.values, order=self.orders[sensorType]).fit()
        
        return self.model[sensorType]
    
    def evaluateModel(self, trainingData, sensorType):
        splitIndex = int(len(trainingData) * 0.8)
        trainSet, testSet = trainingData.iloc[:splitIndex], trainingData.iloc[splitIndex:]

        model = ARIMA(trainSet.values, order=self.orders[sensorType]).fit()
        forecast = model.forecast(steps=len(testSet))
        forecast = pd.Series(forecast, index=testSet.index)
        
        self.metrics = self.printMetrics(testSet, forecast, sensorType, "ARIMA")
        
    def generateForecast(self, sensorType, steps):
        if not self.model[sensorType]:
            raise ValueError("Model not trained yet")
        
        if not self.lastTrainDate:
            raise ValueError("No training data timestamp available")
            
        if self.freq == "T":
            delta = pd.Timedelta(minutes=1)
        elif self.freq == "30T":
            delta = pd.Timedelta(minutes=30)
        elif self.freq == "D":
            delta = pd.Timedelta(days=1)
        else:
            raise ValueError(f"Unsupported frequency: {self.freq}. Must be 'T', '30T', or 'D'")
            
        dates = pd.date_range(
            start=self.lastTrainDate + delta,
            periods=steps,
            freq=self.freq
        )
        
        forecast = self.model[sensorType].forecast(steps=steps)
        
        return pd.Series(forecast, index=dates)
    
    def smape(self, actual, forecast):
        actual = np.array(actual)
        forecast = np.array(forecast)
        numerator = np.abs(forecast - actual)
        denominator = (np.abs(actual) + np.abs(forecast)) / 2
        return 100 * np.mean(numerator / denominator)
    
    def printMetrics(self, actual, forecast, sensorType, modelName="ARIMA"):
        if not isinstance(actual, pd.Series):
            actual = pd.Series(actual)
        if not isinstance(forecast, pd.Series):
            forecast = pd.Series(forecast)

        commonIndex = actual.index.intersection(forecast.index)
        if len(commonIndex) == 0:
            print("No overlapping timestamps between actual and forecast data")
            return
            
        actualAligned = actual[commonIndex]
        forecastAligned = forecast[commonIndex]

        mse = mean_squared_error(actualAligned, forecastAligned)
        mad = mean_absolute_error(actualAligned, forecastAligned)
        smape = self.smape(actualAligned, forecastAligned)

        print(f"\nMetrics for {modelName} on {sensorType} Readings:")
        print(f"\tNumber of compared points: {len(commonIndex)}")
        print(f"\tTime range: {commonIndex[0]} to {commonIndex[-1]}")
        print(f"\tMean Squared Error (MSE): {mse:.5f}")
        print(f"\tMean Absolute Deviation (MAD): {mad:.5f}")
        print(f"\tRoot Mean Squared Error (RMSE): {np.sqrt(mse):.5f}")
        print(f"\tSymmetric Mean Absolute Percentage Error (SMAPE): {smape:.5f}")
        
        return {
            "MSE": mse,
            "MAD": mad,
            "RMSE": np.sqrt(mse),
            "SMAPE": smape
        }
        
        
    def plotForecastsVsActual(self, dates, actual, forecast, sensorType, modelName="ARIMA", minValue=None, maxValue=None):
        plt.figure(figsize=(10, 5))
        plt.plot(dates, actual, marker='o', linestyle='-', label='Actual')
        plt.plot(forecast.index, forecast.values, marker='o', linestyle='-', label='Forecasted')

        if minValue is None: 
            minValue = float(np.min(actual))
        plt.axhline(y=minValue, color='red', linestyle='--', linewidth=1, 
                    label=f'Min {sensorType}: {float(minValue):.2f}{"°C" if sensorType=="Temperature" else "%"}')

        if maxValue is None: 
            maxValue = float(np.max(actual))
        plt.axhline(y=maxValue, color='green', linestyle='--', linewidth=1, 
                    label=f'Max {sensorType}: {float(maxValue):.2f}{"°C" if sensorType=="Temperature" else "%"}')

        plt.title(f'Actual vs Forecasted using {modelName} on {sensorType} Readings')
        plt.xlabel('Date')
        plt.ylabel(f'{sensorType} {"(°C)" if sensorType=="Temperature" else "(%)"}')
        plt.xticks(rotation=45)
        plt.legend()
        plt.tight_layout()
        
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        plt.close() 

        buf.seek(0)
        image = Image.open(buf)
        image = np.array(image)

        return image

