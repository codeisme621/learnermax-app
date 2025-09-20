"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemsRouter = void 0;
const express_1 = require("express");
const dynamodb_1 = require("../services/dynamodb");
const router = (0, express_1.Router)();
exports.itemsRouter = router;
router.get('/', async (req, res, next) => {
    try {
        console.info('Getting all items request received:', {
            method: req.method,
            path: req.path,
            headers: req.headers
        });
        const items = await dynamodb_1.DynamoDBService.getAllItems();
        console.info(`Successfully retrieved ${items.length} items`);
        res.json(items);
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        console.info('Getting item by ID request received:', {
            id,
            method: req.method,
            path: req.path
        });
        const item = await dynamodb_1.DynamoDBService.getItemById(id);
        if (!item) {
            return res.status(404).json({
                error: {
                    message: `Item with id '${id}' not found`,
                    statusCode: 404,
                    timestamp: new Date().toISOString(),
                    path: req.path
                }
            });
        }
        console.info(`Successfully retrieved item with id: ${id}`);
        res.json(item);
    }
    catch (error) {
        next(error);
    }
});
router.post('/', async (req, res, next) => {
    try {
        const { id, name } = req.body;
        console.info('Create/update item request received:', {
            body: req.body,
            method: req.method,
            path: req.path
        });
        if (!id || !name) {
            return res.status(400).json({
                error: {
                    message: 'Both id and name are required in the request body',
                    statusCode: 400,
                    timestamp: new Date().toISOString(),
                    path: req.path
                }
            });
        }
        const item = await dynamodb_1.DynamoDBService.putItem({ id, name });
        console.info(`Successfully created/updated item with id: ${id}`);
        res.json(item);
    }
    catch (error) {
        next(error);
    }
});
