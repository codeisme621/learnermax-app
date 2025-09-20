"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDBService = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const client = new client_dynamodb_1.DynamoDBClient({});
const ddbDocClient = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
const tableName = process.env.SAMPLE_TABLE;
class DynamoDBService {
    static async getAllItems() {
        if (!tableName) {
            throw new Error('SAMPLE_TABLE environment variable is not set');
        }
        try {
            const params = {
                TableName: tableName
            };
            const data = await ddbDocClient.send(new lib_dynamodb_1.ScanCommand(params));
            return data.Items || [];
        }
        catch (error) {
            console.error('Error getting all items:', error);
            throw new Error('Failed to retrieve items from database');
        }
    }
    static async getItemById(id) {
        if (!tableName) {
            throw new Error('SAMPLE_TABLE environment variable is not set');
        }
        if (!id) {
            throw new Error('ID parameter is required');
        }
        try {
            const params = {
                TableName: tableName,
                Key: { id }
            };
            const data = await ddbDocClient.send(new lib_dynamodb_1.GetCommand(params));
            return data.Item || null;
        }
        catch (error) {
            console.error('Error getting item by id:', error);
            throw new Error('Failed to retrieve item from database');
        }
    }
    static async putItem(item) {
        if (!tableName) {
            throw new Error('SAMPLE_TABLE environment variable is not set');
        }
        if (!item.id || !item.name) {
            throw new Error('Both id and name are required');
        }
        try {
            const timestamp = new Date().toISOString();
            const itemWithTimestamps = {
                ...item,
                createdAt: timestamp,
                updatedAt: timestamp
            };
            const params = {
                TableName: tableName,
                Item: itemWithTimestamps
            };
            await ddbDocClient.send(new lib_dynamodb_1.PutCommand(params));
            console.log('Success - item added or updated:', itemWithTimestamps);
            return itemWithTimestamps;
        }
        catch (error) {
            console.error('Error putting item:', error);
            throw new Error('Failed to save item to database');
        }
    }
}
exports.DynamoDBService = DynamoDBService;
