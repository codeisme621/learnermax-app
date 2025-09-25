// Mock the environment variable before importing the service
process.env.SAMPLE_TABLE = 'test-table';

import { DynamoDBService } from '../../../src/services/dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from "aws-sdk-client-mock";

describe('Test DynamoDBService', () => {
    const ddbMock = mockClient(DynamoDBDocumentClient);

    beforeEach(() => {
        ddbMock.reset();
        process.env.SAMPLE_TABLE = 'test-table';
    });

    describe('getAllItems', () => {
        it('should return all items', async () => {
            const items = [
                { id: 'id1', name: 'name1' },
                { id: 'id2', name: 'name2' }
            ];

            ddbMock.on(ScanCommand).resolves({
                Items: items,
            });

            const result = await DynamoDBService.getAllItems();
            expect(result).toEqual(items);
        });

        it('should return empty array when no items', async () => {
            ddbMock.on(ScanCommand).resolves({
                Items: undefined,
            });

            const result = await DynamoDBService.getAllItems();
            expect(result).toEqual([]);
        });

        // Note: Testing table name not set would require a separate test module
    });

    describe('getItemById', () => {
        it('should return item by id', async () => {
            const item = { id: 'id1', name: 'name1' };

            ddbMock.on(GetCommand).resolves({
                Item: item,
            });

            const result = await DynamoDBService.getItemById('id1');
            expect(result).toEqual(item);
        });

        it('should return null when item not found', async () => {
            ddbMock.on(GetCommand).resolves({
                Item: undefined,
            });

            const result = await DynamoDBService.getItemById('nonexistent');
            expect(result).toBeNull();
        });

        it('should throw error when id not provided', async () => {
            await expect(DynamoDBService.getItemById('')).rejects.toThrow('ID parameter is required');
        });

        // Note: Testing table name not set would require a separate test module
    });

    describe('putItem', () => {
        it('should create item with timestamps', async () => {
            const inputItem = { id: 'id1', name: 'name1' };

            ddbMock.on(PutCommand).resolves({});

            const result = await DynamoDBService.putItem(inputItem);

            expect(result.id).toBe('id1');
            expect(result.name).toBe('name1');
            expect(result.createdAt).toBeDefined();
            expect(result.updatedAt).toBeDefined();
            expect(typeof result.createdAt).toBe('string');
            expect(typeof result.updatedAt).toBe('string');
        });

        it('should throw error when id missing', async () => {
            const inputItem = { name: 'name1' } as any;

            await expect(DynamoDBService.putItem(inputItem)).rejects.toThrow('Both id and name are required');
        });

        it('should throw error when name missing', async () => {
            const inputItem = { id: 'id1' } as any;

            await expect(DynamoDBService.putItem(inputItem)).rejects.toThrow('Both id and name are required');
        });

        // Note: Testing table name not set would require a separate test module
    });
});