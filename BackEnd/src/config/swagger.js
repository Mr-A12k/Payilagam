const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Payilagam API",
      version: "1.0.0",
      description: "API documentation for the TaskPro Backend.",
    },
    servers: [
      {
        url: "http://localhost:5005",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Document all routes
  apis: ["./src/modules/**/*.routes.js", "./src/modules/**/*.controller.js"],
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  const uiOptions = {
    swaggerOptions: {
      tagsSorter: "alpha",       // Sorts the tags (categories) A-Z
      operationsSorter: "alpha", // Sorts the endpoints inside each category A-Z
    },
  };

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, uiOptions));
  console.log("Swagger Docs available at /api-docs");
};

module.exports = setupSwagger;
