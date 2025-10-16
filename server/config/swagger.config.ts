import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import type { Express } from "express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Old Vibes API",
      version: "1.0.0",
      description:
        "A platform for sharing and discovering old vibes - connecting buyers and sellers of secondhand items",
    },
    servers: [
      // ✅ Make production server first (default)
      ...(process.env.NODE_ENV === "production"
        ? [
            {
              url: `https://api.${process.env.ROOT_DOMAIN}/api`,
              description: "Production server",
            },
            {
              url: "http://localhost:4000/api",
              description: "Development server (for testing)",
            },
          ]
        : [
            {
              url: "http://localhost:4000/api",
              description: "Development server",
            },
            {
              url: `https://api.${process.env.ROOT_DOMAIN || "oldvibes.io.vn"}/api`,
              description: "Production server",
            },
          ]),
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token in format: Bearer <token>",
        },
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
          description: "HTTP-only cookie authentication",
        },
      },
    },
  },
  apis: [
    "./routes/*.ts",      // Scan routes for API definitions
    "./controllers/*.ts"  // Scan controllers for JSDoc comments
  ],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Old Vibes API Documentation",
      swaggerOptions: {
        // ✅ Force server selection dropdown to show
        servers: [
          ...(process.env.NODE_ENV === "production"
            ? [
                {
                  url: `https://api.${process.env.ROOT_DOMAIN}/api`,
                  description: "Production server",
                },
                {
                  url: "http://localhost:4000/api",
                  description: "Development server (for testing)",
                },
              ]
            : [
                {
                  url: "http://localhost:4000/api",
                  description: "Development server",
                },
                {
                  url: `https://api.${process.env.ROOT_DOMAIN || "oldvibes.io.vn"}/api`,
                  description: "Production server",
                },
              ]),
        ],
        showCommonExtensions: true,
        showExtensions: true,
        // ✅ Enable server selector
        supportedSubmitMethods: ["get", "post", "put", "delete", "patch"],
        defaultModelRendering: "model",
        docExpansion: "none",
        // ✅ This ensures the server dropdown is visible
        layout: "BaseLayout",
        deepLinking: true,
      },
    }),
  );

  // ✅ Add environment info logging
  const currentDomain = process.env.ROOT_DOMAIN || "localhost";
  const apiUrl =
    process.env.NODE_ENV === "production"
      ? `https://api.${currentDomain}`
      : `http://localhost:4000`;

  console.log("📚 Swagger UI available at /api-docs");
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 API Base URL: ${apiUrl}/api`);
  console.log(`📖 Full Swagger URL: ${apiUrl}/api-docs`);
};
