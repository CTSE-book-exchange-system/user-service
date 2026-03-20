const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger'); // or './swagger' depending on structure
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
