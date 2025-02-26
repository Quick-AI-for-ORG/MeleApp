import os
import sys
import asyncio
from dotenv import load_dotenv
from pymongo import AsyncMongoClient

sys.path.append(os.path.join(os.path.dirname('../../Shared')))
from Shared.Result import Result

class CRUDInterface:
    def __init__(self):
        load_dotenv("../../../.env")
        self.Result = Result        
        try:
            self.client = AsyncMongoClient(os.getenv('MONGODB_URI'))
            print("Connected to MongoDB successfully")
        except Exception as e:
            print("MongoDB connection error:", e)
        self.db = self.client["meleDB"]
        self.logs = self.db["logs"]
    
    async def create(self, data, collectionName, compareKey):
        try:
            collection = self.db[collectionName]
            compareClause = {compareKey: data[compareKey]}
            existingRecord = await collection.find_one(compareClause)
            
            if not existingRecord:
                result = await collection.insert_one(data)
                inserted_id = result.inserted_id
                created_record = await collection.find_one({"_id": inserted_id})
                
                await self.logs.insert_one({
                    "log": f"Created new record with {compareKey}: {data[compareKey]}",
                    "degree": 1
                })
                return self.Result(1, created_record, f"Created new record with {compareKey}: {data[compareKey]}")
            else:
                await self.logs.insert_one({
                    "log": f"Record with {compareKey}: {data[compareKey]} already exists. Skipping creation.", 
                    "degree": 0
                })
                return self.Result(0, None, f"Record with {compareKey}: {data[compareKey]} already exists. Skipping creation.")
        except Exception as error:
            await self.logs.insert_one({
                "log": f"Error adding data: {error}", 
                "degree": -1
            })
            return self.Result(-1, None, f"Error adding data: {error}")

    async def modify(self, primaryKey, newData, collectionName, compareKey):
        try:
            collection = self.db[collectionName]
            compareClause = {compareKey: primaryKey}
            result = await collection.find_one_and_update(
                compareClause, 
                {"$set": newData}, 
                return_document=pymongo.ReturnDocument.AFTER
            )
            
            if not result:
                await self.logs.insert_one({
                    "log": f"Record with {compareKey}: {primaryKey} not found. Skipping modification.",
                    "degree": 0
                })
                return self.Result(0, None, f"Record with {compareKey}: {primaryKey} not found. Skipping modification.")
            else:
                await self.logs.insert_one({
                    "log": f"Updated record with {compareKey}: {newData.get(compareKey, primaryKey)}", 
                    "degree": 1
                })
                return self.Result(1, result, f"Updated record with {compareKey}: {newData.get(compareKey, primaryKey)}")
        except Exception as error:
            await self.logs.insert_one({
                "log": f"Error modifying data: {error}", 
                "degree": -1
            })
            return self.Result(-1, None, f"Error modifying data: {error}")

    async def remove(self, primaryKey, collectionName, compareKey):
        try:
            collection = self.db[collectionName]
            compareClause = {compareKey: primaryKey}
            result = await collection.find_one_and_delete(compareClause)
            
            if not result:
                await self.logs.insert_one({
                    "log": f"Record with {compareKey}: {primaryKey} not found. Skipping deletion.",
                    "degree": 0
                })
                return self.Result(0, None, f"Record with {compareKey}: {primaryKey} not found. Skipping deletion.")
            else:
                await self.logs.insert_one({
                    "log": f"Deleted record with {compareKey}: {primaryKey}", 
                    "degree": 1
                })
                return self.Result(1, result, f"Deleted record with {compareKey}: {primaryKey}")
        except Exception as error:
            await self.logs.insert_one({
                "log": f"Error removing data: {error}", 
                "degree": -1
            })
            return self.Result(-1, None, f"Error removing data: {error}")

    async def removeAll(self, primaryKey, collectionName, compareKey):
        try:
            collection = self.db[collectionName]
            compareClause = {compareKey: primaryKey}
            result = await collection.delete_many(compareClause)
            
            if result.deleted_count == 0:
                await self.logs.insert_one({
                    "log": f"No records found with {compareKey}: {primaryKey}. Skipping deletion.",
                    "degree": 0
                })
                return self.Result(0, None, f"No records found with {compareKey}: {primaryKey}. Skipping deletion.")
            else:
                await self.logs.insert_one({
                    "log": f"Deleted {result.deleted_count} records with {compareKey}: {primaryKey}",
                    "degree": 1
                })
                return self.Result(1, {"deleted_count": result.deleted_count}, f"Deleted {result.deleted_count} records with {compareKey}: {primaryKey}")
        except Exception as error:
            await self.logs.insert_one({
                "log": f"Error removing data: {error}", 
                "degree": -1
            })
            return self.Result(-1, None, f"Error removing data: {error}")

    async def get(self, primaryKey, collectionName, compareKey):
        try:
            collection = self.db[collectionName]
            compareClause = {compareKey: primaryKey}
            record = await collection.find_one(compareClause)
            
            if record:
                await self.logs.insert_one({
                    "log": f"Found record with {compareKey}: {primaryKey}", 
                    "degree": 1
                })
                return self.Result(1, record, f"Found record with {compareKey}: {primaryKey}")
            else:
                await self.logs.insert_one({
                    "log": f"Record with {compareKey}: {primaryKey} not found.",
                    "degree": 0
                })
                return self.Result(0, None, f"Record with {compareKey}: {primaryKey} not found.")
        except Exception as error:
            await self.logs.insert_one({
                "log": f"Error getting data: {error}", 
                "degree": -1
            })
            return self.Result(-1, None, f"Error getting data: {error}")

    async def getAll(self, collectionName):
        try:
            collection = self.db[collectionName]
            records = []
            async for record in collection.find():
                records.append(record)
            
            await self.logs.insert_one({
                "log": f"Found {len(records)} records in {collectionName}.", 
                "degree": 1
            })
            return self.Result(1, records, f"Found {len(records)} records in {collectionName}.")
        except Exception as error:
            await self.logs.insert_one({
                "log": f"Error getting all data: {error}", 
                "degree": -1
            })
            return self.Result(-1, None, f"Error getting all data: {error}")

    async def getAllFiltered(self, primaryKey, collectionName, compareKey):
        try:
            collection = self.db[collectionName]
            compareClause = {compareKey: primaryKey}
            records = []
            async for record in collection.find(compareClause):
                records.append(record)
            
            if len(records) == 0:
                await self.logs.insert_one({
                    "log": f"No records found in {collectionName} with {compareKey}: {primaryKey}.",
                    "degree": 0
                })
                return self.Result(0, None, f"No records found in {collectionName} with {compareKey}: {primaryKey}.")
            
            await self.logs.insert_one({
                "log": f"Found {len(records)} records in {collectionName} with {compareKey}: {primaryKey}.",
                "degree": 1
            })
            return self.Result(1, records, f"Found {len(records)} records in {collectionName} with {compareKey}: {primaryKey}.")
        except Exception as error:
            await self.logs.insert_one({
                "log": f"Error getting all data: {error}", 
                "degree": -1
            })
            return self.Result(-1, None, f"Error getting all data: {error}")
        
        