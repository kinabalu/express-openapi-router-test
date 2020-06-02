const express = require('express')
const router = express.Router()

module.exports = (oapi) => {
    
    router.get('/me', oapi.path({
        description: 'Return this in oapi',
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
    }), (req, res) => {
        res.status(200).send("OK")
    })
    
    return router
}
