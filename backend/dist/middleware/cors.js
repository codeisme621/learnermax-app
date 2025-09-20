"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsMiddleware = void 0;
const corsMiddleware = (req, res, next) => {
    const environment = process.env.ENVIRONMENT || 'dev';
    const origin = req.headers.origin;
    let allowedOrigins;
    if (environment === 'prod') {
        allowedOrigins = ['https://www.learnermax.com'];
    }
    else {
        allowedOrigins = [
            'http://localhost:3000',
            'https://www.learnermax.com'
        ];
    }
    let corsOrigin = '';
    if (origin) {
        if (allowedOrigins.includes(origin) ||
            (environment === 'dev' && origin.includes('.vercel.app'))) {
            corsOrigin = origin;
        }
    }
    res.header('Access-Control-Allow-Origin', corsOrigin);
    res.header('Access-Control-Allow-Headers', 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token');
    res.header('Access-Control-Allow-Methods', 'OPTIONS,POST,GET,PUT,DELETE');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
};
exports.corsMiddleware = corsMiddleware;
