import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

// Create clients and set shared const values outside of handlers for connection reuse
const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

export interface Item {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export class DynamoDBService {
  static async getAllItems(): Promise<Item[]> {
    if (!tableName) {
      throw new Error('SAMPLE_TABLE environment variable is not set');
    }

    try {
      const params = {
        TableName: tableName
      };

      const data = await ddbDocClient.send(new ScanCommand(params));
      return data.Items as Item[] || [];
    } catch (error) {
      console.error('Error getting all items:', error);
      throw new Error('Failed to retrieve items from database');
    }
  }

  static async getItemById(id: string): Promise<Item | null> {
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

      const data = await ddbDocClient.send(new GetCommand(params));
      return data.Item as Item || null;
    } catch (error) {
      console.error('Error getting item by id:', error);
      throw new Error('Failed to retrieve item from database');
    }
  }

  static async putItem(item: Omit<Item, 'createdAt' | 'updatedAt'>): Promise<Item> {
    if (!tableName) {
      throw new Error('SAMPLE_TABLE environment variable is not set');
    }

    if (!item.id || !item.name) {
      throw new Error('Both id and name are required');
    }

    try {
      const timestamp = new Date().toISOString();
      const itemWithTimestamps: Item = {
        ...item,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      const params = {
        TableName: tableName,
        Item: itemWithTimestamps
      };

      await ddbDocClient.send(new PutCommand(params));
      console.log('Success - item added or updated:', itemWithTimestamps);

      return itemWithTimestamps;
    } catch (error) {
      console.error('Error putting item:', error);
      throw new Error('Failed to save item to database');
    }
  }
}