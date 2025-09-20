// Create clients and set shared const values outside of the handler.

// Create a DocumentClient that represents the query to add an item
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

/**
 * A simple example includes a HTTP get method to get all items from a DynamoDB table.
 */
export const getAllItemsHandler = async (event) => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`getAllItems only accept GET method, you tried: ${event.httpMethod}`);
    }
    // All log statements are written to CloudWatch
    console.info('received:', event);

    // get all items from the table (only first 1MB data, you can use `LastEvaluatedKey` to get the rest of data)
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#scan-property
    // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Scan.html
    var params = {
        TableName : tableName
    };

    try {
        const data = await ddbDocClient.send(new ScanCommand(params));
        var items = data.Items;
    } catch (err) {
        console.log("Error", err);
    }

    // Environment-aware CORS configuration
    const environment = process.env.ENVIRONMENT || 'dev';
    const origin = event.headers?.origin || event.headers?.Origin;

    let allowedOrigins;
    if (environment === 'prod') {
        allowedOrigins = ['https://www.learnermax.com'];
    } else {
        allowedOrigins = [
            'http://localhost:3000',
            'https://www.learnermax.com'
        ];
    }

    // Check if request origin is allowed, also allow vercel.app domains for dev
    let corsOrigin = '';
    if (origin) {
        if (allowedOrigins.includes(origin) ||
            (environment === 'dev' && origin.includes('.vercel.app'))) {
            corsOrigin = origin;
        }
    }

    const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
            "Access-Control-Allow-Origin": corsOrigin,
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE"
        },
        body: JSON.stringify(items)
    };

    // All log statements are written to CloudWatch
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
}
