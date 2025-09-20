import { Router, Request, Response, NextFunction } from 'express';
import { DynamoDBService } from '../services/dynamodb';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Item:
 *       type: object
 *       required:
 *         - id
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the item
 *         name:
 *           type: string
 *           description: Name of the item
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *             statusCode:
 *               type: number
 *             timestamp:
 *               type: string
 *               format: date-time
 *             path:
 *               type: string
 */

/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: Get all items
 *     description: Retrieve all items from the DynamoDB table
 *     tags: [Items]
 *     responses:
 *       200:
 *         description: List of all items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.info('Getting all items request received:', {
      method: req.method,
      path: req.path,
      headers: req.headers
    });

    const items = await DynamoDBService.getAllItems();

    console.info(`Successfully retrieved ${items.length} items`);
    res.json(items);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/items/{id}:
 *   get:
 *     summary: Get item by ID
 *     description: Retrieve a specific item by its ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The item ID
 *     responses:
 *       200:
 *         description: Item found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Invalid ID parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    console.info('Getting item by ID request received:', {
      id,
      method: req.method,
      path: req.path
    });

    const item = await DynamoDBService.getItemById(id);

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
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/items:
 *   post:
 *     summary: Create or update an item
 *     description: Create a new item or update an existing one
 *     tags: [Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - name
 *             properties:
 *               id:
 *                 type: string
 *                 description: Unique identifier for the item
 *               name:
 *                 type: string
 *                 description: Name of the item
 *     responses:
 *       200:
 *         description: Item created or updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
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

    const item = await DynamoDBService.putItem({ id, name });

    console.info(`Successfully created/updated item with id: ${id}`);
    res.json(item);
  } catch (error) {
    next(error);
  }
});

export { router as itemsRouter };