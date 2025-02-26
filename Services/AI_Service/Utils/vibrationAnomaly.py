import random
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from tensorflow.keras.layers import Dense, Input, Dropout
from tensorflow.keras.models import Sequential, Model
from sklearn.metrics import mean_squared_error
from sklearn.preprocessing import StandardScaler
from tensorflow.keras.callbacks import EarlyStopping
import tensorflow as tf

class vibrationAnomalyDetector():
    def __init__(self, n1=16, n2=8, dropout_rate=0.2, l2_reg=0.001):
        # Save parameters
        self.n1 = n1
        self.n2 = n2
        self.dropout_rate = dropout_rate
        self.l2_reg = l2_reg
        self.normalizer = StandardScaler()
        
        # Set up regularizer
        regularizer = tf.keras.regularizers.l2(self.l2_reg)
        
        # Build encoder
        encoder = Sequential([
            Input(shape=(1,)),
            Dense(n1, activation='relu', kernel_regularizer=regularizer),
            Dropout(dropout_rate),
            Dense(n2, activation='relu', kernel_regularizer=regularizer)
        ])
        
        # Build decoder
        decoder = Sequential([
            Input(shape=(n2,)),
            Dense(n1, activation='relu', kernel_regularizer=regularizer),
            Dropout(dropout_rate),
            Dense(1, activation='linear')
        ])
        
        # Connect them
        self.model = Sequential([encoder, decoder])
        self.model.compile(optimizer='adam', loss='mean_squared_error')
    
    def normalize(self, data, test):
        """Normalize training and test data"""
        self.normalizer.fit(data.values.reshape(-1, 1))
        xTrain = self.normalizer.transform(data.values.reshape(-1, 1))
        xTest = self.normalizer.transform(test.values.reshape(-1, 1))
        return xTrain, xTest
    
    def train(self, data, epochs=100):
        """Train the model with early stopping to prevent overfitting"""
        # Reshape if needed
        if isinstance(data, pd.Series):
            data = data.values.reshape(-1, 1)
        elif len(data.shape) == 1:
            data = data.reshape(-1, 1)
            
        # Normalize the data
        self.normalizer.fit(data)
        data_normalized = self.normalizer.transform(data)
        
        # Save min/max of normal data
        self.minNormalValue = np.min(data)
        self.maxNormalValue = np.max(data)
        
        # Set up early stopping
        early_stopping = EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True,
            verbose=1
        )
        
        # Train the model
        self.history = self.model.fit(
            data_normalized, 
            data_normalized,
            epochs=epochs,
            batch_size=32,
            shuffle=True,
            validation_split=0.2,
            callbacks=[early_stopping],
            verbose=0
        )
        
        return self.history
    
    def test(self, data, threshold=90):
        """Test for anomalies based on reconstruction error"""
        self.errors = []
        anomalies = []
        
        # Reshape if needed
        if isinstance(data, pd.Series):
            data = data.values
        if len(data.shape) == 1:
            data = data.reshape(-1, 1)
            
        # Normalize the test data
        data_normalized = self.normalizer.transform(data)
        
        # Get predictions
        preds_normalized = self.model.predict(data_normalized)
        self.predictions = self.normalizer.inverse_transform(preds_normalized)
        
        # Calculate reconstruction errors
        for i in range(len(data_normalized)):
            mse = mean_squared_error([data_normalized[i]], [preds_normalized[i]])
            self.errors.append(mse)
        
        # Set threshold based on percentile
        self.threshold = np.percentile(self.errors, threshold)
        
        # Detect anomalies
        for i in range(len(data)):
            if self.errors[i] >= self.threshold:
                anomalies.append(f"Anomaly Detected for entry: {data[i][0]:.4f} with Mean Squared Error (MSE): {self.errors[i]:.4f}")
        
        return self.predictions, self.errors, self.threshold, anomalies
    
    def plotErrors(self):
        """Plot errors with anomaly threshold"""
        if not hasattr(self, 'errors') or not hasattr(self, 'threshold'):
            print("No errors to plot. Run test() first!")
            return
            
        errors = self.errors
        threshold = self.threshold
        
        # Identify normal and anomaly points
        normal = [i for i in range(len(errors)) if errors[i] < threshold]
        anomalies = [i for i in range(len(errors)) if errors[i] >= threshold]
        
        plt.figure(figsize=(10, 6))
        plt.scatter(normal, [errors[i] for i in normal], color='g', label='Normal', alpha=0.6)
        plt.scatter(anomalies, [errors[i] for i in anomalies], color='r', label='Anomalous', alpha=0.6)
        plt.axhline(threshold, color='black', linestyle='--', label=f'Threshold ({threshold:.2f})')
        
        plt.xlabel("Data Index")
        plt.ylabel("Mean Squared Error (MSE)")
        plt.title("Anomaly Detection - MSE Errors")
        plt.legend(loc='upper right')
        
        plt.savefig("errors.png")
        plt.show()
        
    def plotReconstructedData(self):
        """Plot reconstructed data showing normal vs anomalous values"""
        if not hasattr(self, 'predictions'):
            print("No predictions to plot. Run test() first!")
            return
            
        reconstructed = self.predictions
        minNormalValue = self.minNormalValue
        maxNormalValue = self.maxNormalValue
        
        # Identify anomalous points based on reconstruction error (better method)
        anomaly_indices = [i for i in range(len(self.errors)) if self.errors[i] >= self.threshold]
        normal_indices = [i for i in range(len(self.errors)) if self.errors[i] < self.threshold]
        
        # Extract values
        normal_values = [reconstructed[i][0] for i in normal_indices]
        anomalous_values = [reconstructed[i][0] for i in anomaly_indices]
        
        plt.figure(figsize=(10, 6))
        plt.scatter(normal_indices, normal_values, color='g', label='Normal Data')
        plt.scatter(anomaly_indices, anomalous_values, color='r', label='Anomalous Data')
        
        plt.xlabel("Index")
        plt.ylabel("Reconstructed Value")
        plt.title("Reconstructed Data with Normal and Anomalous Values")
        plt.legend()
        
        plt.savefig("reconstructed.png")
        plt.show()
        
    def plotTrainingHistory(self):
        """Plot training and validation loss to check for overfitting"""
        if not hasattr(self, 'history'):
            print("Model hasn't been trained yet!")
            return
            
        plt.figure(figsize=(10, 6))
        plt.plot(self.history.history['loss'], label='Training Loss')
        plt.plot(self.history.history['val_loss'], label='Validation Loss')
        plt.title('Model Loss During Training')
        plt.ylabel('Loss')
        plt.xlabel('Epoch')
        plt.legend()
        plt.savefig("training_loss.png")
        plt.show()