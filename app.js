#!/usr/bin/env node
const express = require('express')
const morgan = require('morgan')
const rfs = require('rotating-file-stream')

const bodyParser = require('body-parser')
const cors = require('cors')

const {
    name:APP_NAME,
    version:APP_VERSION
} = require('./package.json')

const openapi = require('@wesleytodd/openapi')
const app = express();

const SERVER_PORT = process.env.NODE_ENV === 'test' ? 5001 : 5000


const whitelist = ['localhost']
const corsOptions = {
    origin: (origin, callback) => {
        if(typeof(origin) === 'undefined') {
            callback(null, true);
        } else if (whitelist.some(function(v) { return origin.indexOf(v) >= 0; })) {
            callback(null, true)
        } else {
            callback(null, false)
        }
    }
};

app.options('*', cors(corsOptions))

const oapi = openapi({
    openapi: '3.0.0',
    info: {
        title: 'Test Router',
        description: 'Testing Router',
        version: '0.0.1',
    }
})


// Set up basic access logging with file rotation:
app.use(morgan('combined', {stream: rfs.createStream('access.log', {maxFiles: 5, size: '100M'})}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(corsOptions))

app.use('/redoc', oapi.redoc)

/**
 * Mimic the finagle lifecycle management endpoints.
 */
app.get('/health', oapi.path({
    description: 'Health check',
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                    }
                }
            }
        }
    }
}), require('./routes/health_check'))
app.use('/tests', require('./routes/tests')(oapi))

app.use(oapi)

const server = app.listen(SERVER_PORT)

module.exports = { app, server }

