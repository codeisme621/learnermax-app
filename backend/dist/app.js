"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const path_1 = __importDefault(require("path"));
const items_1 = require("./routes/items");
const errorHandler_1 = require("./middleware/errorHandler");
const cors_1 = require("./middleware/cors");
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use(cors_1.corsMiddleware);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.ENVIRONMENT || 'dev'
    });
});
app.use('/api/items', items_1.itemsRouter);
app.get('/', (req, res) => {
    res.json({
        message: 'LearnerMax API',
        version: '1.0.0',
        documentation: '/openapi.yaml'
    });
});
app.get('/openapi.yaml', (req, res) => {
    res.type('text/yaml');
    res.sendFile(path_1.default.join(__dirname, '../openapi.yaml'));
});
app.use(errorHandler_1.errorHandler);
app.listen(port, () => {
    console.log(`LearnerMax API server listening on port ${port}`);
    console.log(`Environment: ${process.env.ENVIRONMENT || 'dev'}`);
});
exports.default = app;
