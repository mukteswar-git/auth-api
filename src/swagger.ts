const swaggerSpec = {
  openapi: "3.0.0",

  info: {
    title: "Auth API",
    version: "1.0.0",
    description: "Authentication API",
  },

  components: {
    schemas: {
      User: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 13,
          },
          email: {
            type: "string",
            example: "auth@example.com",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2026-09-30T15:15:13.000Z",
          },
        },
      },
    },

    securitySchemes: {
      sessionCookie: {
        type: "apiKey",
        in: "cookie",
        name: "sessionId",
      },
    },
  },

  paths: {
    "/auth/register": {
      post: {
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    example: "swagger@example.com",
                  },
                  password: {
                    type: "string",
                    example: "secret123",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },
          "400": { "description": "Invalid input" },
          "409": { "description": "Email already exists" },
          "500": { "description": "Internal server error" },
        },
      },
    },

    "/auth/login": {
      post: {
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    example: "swagger@example.com",
                  },
                  password: {
                    type: "string",
                    example: "secret123",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "string",
                      example: "Ok",
                    },
                  },
                },
              },
            },
          },
          "400": { "description": "Invalid input" },
          "401": { "description": "Invalid credentials" },
        },
      },
    },

    "/auth/me": {
      get: {
        summary: "Get current user",
        security: [{ sessionCookie: [] }],
        responses: {
          "200": {
            description: "Current user",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },
          "401": { "description": "Not authenticated" },
        },
      },
    },

    "/auth/logout": {
      post: {
        summary: "Logout",
        security: [{ sessionCookie: [] }],
        responses: {
          "200": {
            description: "Logged out successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "string",
                      example: "Logged out",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export default swaggerSpec;
