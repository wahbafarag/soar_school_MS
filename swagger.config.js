const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "School MS API - Soar",
      version: "1.0.0",
      description: "API documentation for the School MS",
    },
    servers: [
      {
        url: `http://localhost:${process.env.USER_PORT || 5111}/api`,
        description: "Soar - Task Docs",
      },
    ],
  },
  apis: ["./managers/entities/**/*.swagger.js"],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
