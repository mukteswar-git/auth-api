# Authentication API

A backend authentication API built with Node.js, TypeScript, Express,
PostgreSQL, Redis, Prisma, Docker, and automated API tests.

The project implements session-based authentication with Redis-backed
sessions, HTTP-only cookies, request validation, password hashing,
security middleware, rate limiting, API documentation, and integration
tests.

## Features

- User registration
- User login
- Session-based authentication
- Redis-backed sessions with expiration
- HTTP-only authentication cookies
- Secure cookie configuration for production
- Password hashing with bcrypt
- Request validation with Zod
- Protected authentication middleware
- Logout and session invalidation
- Helmet security headers
- Login rate limiting
- Centralized error handling
- PostgreSQL persistence with Prisma
- Docker and Docker Compose
- Swagger/OpenAPI documentation
- Vitest and Supertest API tests

## Tech Stack

| Technology | Purpose |
| --- | --- |
| Node.js 24 | JavaScript runtime |
| TypeScript | Application language |
| Express 5 | HTTP API framework |
| Prisma | Database ORM |
| PostgreSQL 18 | Relational database |
| Redis 8 | Session storage |
| Zod | Request validation |
| bcrypt | Password hashing |
| Helmet | HTTP security headers |
| express-rate-limit | Login rate limiting |
| Swagger/OpenAPI | API documentation |
| Vitest | Test runner |
| Supertest | HTTP API testing |
| Docker | Containerization |
| Docker Compose | Local service orchestration |

## Architecture

``` text
                         ┌─────────────────┐
                         │     Client      │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   Express API   │
                         │   Node.js/TS    │
                         └────────┬────────┘
                                  │
                  ┌───────────────┼───────────────┐
                  │               │               │
                  ▼               ▼               ▼
           ┌────────────┐  ┌────────────┐  ┌────────────┐
           │ PostgreSQL │  │   Redis    │  │ Middleware │
           │   Users    │  │  Sessions  │  │ Validation │
           └────────────┘  └────────────┘  │  Security  │
                                           └────────────┘
```

The API uses PostgreSQL as the persistent source of user data and Redis
as the temporary session store.

## Authentication Flow

### Registration

``` text
Client
  │
  │ email + password
  ▼
Zod validation
  │
  ▼
bcrypt password hashing
  │
  ▼
PostgreSQL
  │
  ▼
User created
```

Passwords are never stored in plaintext. Only the bcrypt password hash
is persisted.

### Login

``` text
Client
  │
  │ email + password
  ▼
Zod validation
  │
  ▼
Find user in PostgreSQL
  │
  ▼
bcrypt.compare()
  │
  ▼
Generate session ID
  │
  ├──────────────► Redis
  │                session:<id> → user ID
  │
  ▼
HTTP-only cookie
```

The session is stored in Redis with a time-to-live. The client receives
the session ID through an HTTP-only cookie rather than receiving the
user's credentials or a long-lived authentication token.

### Authenticated Request

``` text
Client
  │
  │ HTTP-only session cookie
  ▼
Express API
  │
  ▼
Read session ID
  │
  ▼
Look up session in Redis
  │
  ▼
Retrieve user from PostgreSQL
  │
  ▼
Authenticated request
```

### Logout

``` text
Client
  │
  ▼
POST /auth/logout
  │
  ├── Delete session from Redis
  │
  └── Clear authentication cookie
```

Deleting the Redis session invalidates the session immediately.

## API Endpoints

| Method | Endpoint | Description | Authentication |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Create a new account | No |
| `POST` | `/auth/login` | Authenticate a user | No |
| `GET` | `/auth/me` | Get the current authenticated user | Yes |
| `POST` | `/auth/logout` | End the current session | Yes |
| `GET` | `/docs` | Swagger/OpenAPI documentation | No |

## Security

Security was treated as part of the application design rather than as an
afterthought.

### Password Security

Passwords are hashed using bcrypt before being stored in PostgreSQL.

``` text
Plain password
      │
      ▼
   bcrypt
      │
      ▼
Password hash
      │
      ▼
PostgreSQL
```

The original password is never stored.

### HTTP-only Cookies

The session ID is stored in an HTTP-only cookie. This prevents
client-side JavaScript from directly reading the authentication cookie.

### SameSite Cookies

The cookie uses `SameSite=Lax` to reduce cross-site request risks while
still allowing normal navigation behavior.

### Secure Cookies

The cookie is configured to use the `Secure` flag in production so it is
transmitted only over HTTPS.

### Helmet

Helmet adds security-related HTTP headers to API responses.

### Rate Limiting

Login requests are rate limited to reduce repeated password-guessing
attempts.

### Input Validation

Authentication requests are validated with Zod before application logic
is executed.

### Session Expiration

Redis sessions have a TTL, preventing sessions from remaining valid
indefinitely.

### Centralized Error Handling

Errors are handled through centralized Express middleware so API
responses remain consistent and implementation details are not
unnecessarily exposed.

## Docker

The application is containerized using Docker Compose.

``` text
┌───────────────────────────┐
│           API             │
│       Node.js + Express   │
│        Port 3000          │
└─────────────┬─────────────┘
              │
       ┌──────┴──────┐
       │             │
       ▼             ▼
┌──────────────┐ ┌──────────────┐
│  PostgreSQL  │ │    Redis     │
│    :5432     │ │    :6379     │
└──────────────┘ └──────────────┘
```

The services communicate using Docker Compose service names rather than
`localhost`.

For example, the API connects to PostgreSQL and Redis through their
Compose network addresses.

## Running the Project

### Prerequisites

Install:

- Docker
- Docker Compose

Node.js and npm are useful for local development and running commands
outside the containers.

### 1. Clone the repository

``` bash
git clone https://github.com/mukteswar-git/auth-api
cd auth-api
```

### 2. Configure environment variables

Create a `.env` file based on `.env.example`.

Example:

``` env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

Do not commit `.env` files or credentials to the repository.

### 3. Start the application

``` bash
docker compose up -d --build
```

Check the running services:

``` bash
docker compose ps
```

### 4. View the API

The API runs on:

``` text
http://localhost:3000
```

Swagger/OpenAPI documentation is available at:

``` text
http://localhost:3000/docs
```

### 5. Stop the application

To stop the containers and remove their associated Compose resources:

``` bash
docker compose down
```

The PostgreSQL data is stored in a Docker volume so database data can
persist across normal container recreation.

## Database

Prisma is used as the ORM for PostgreSQL.

Apply the existing migrations with:

```bash
npx prisma migrate deploy
```

Generate the Prisma client when required:

``` bash
npx prisma generate
```

The production/container workflow can run the appropriate Prisma
commands from the API container.

## Testing

The project uses Vitest and Supertest for HTTP-level API testing.

Run the test suite with:

``` bash
npm test
```

The test suite covers the main authentication lifecycle, including:

- Successful registration
- Invalid registration data
- Duplicate registration
- Successful login
- Invalid password
- Unknown user
- Unauthenticated `/auth/me`
- Authenticated `/auth/me`
- Logout
- Session invalidation after logout

A successful test run confirms the main authentication flow from HTTP
request through PostgreSQL and Redis.

## Example Authentication Flow

A typical user lifecycle is:

``` text
POST /auth/register
        │
        ▼
User created
        │
        ▼
POST /auth/login
        │
        ▼
Session created in Redis
        │
        ▼
HTTP-only cookie issued
        │
        ▼
GET /auth/me
        │
        ▼
Authenticated user
        │
        ▼
POST /auth/logout
        │
        ▼
Redis session deleted
        │
        ▼
GET /auth/me
        │
        ▼
Unauthorized
```

## Project Structure

The repository is organized around the API source code, database
configuration, tests, and container configuration.

``` text
.
├── prisma/
│   └── migrations/
├── src/
├── tests/
├── Dockerfile
├── compose.yaml
├── prisma.config.ts
├── tsconfig.json
├── vitest.config.ts
├── package.json
└── .env.example
```

The exact internal source structure may evolve as the API grows, while
the major responsibilities remain separated between application code,
database configuration, tests, and infrastructure.

## API Documentation

Swagger/OpenAPI documentation is exposed by the application at:

``` text
GET /docs
```

When running locally:

``` text
http://localhost:3000/docs
```

The documentation provides an interactive way to inspect and test the
API endpoints.

## What I Learned

This project was built to understand authentication as a complete
backend system rather than simply implementing an email-and-password
check.

Key areas covered:

- Session-based authentication
- Redis-backed session management
- HTTP-only cookie authentication
- Password hashing
- Request validation
- Authentication middleware
- PostgreSQL data persistence
- Prisma ORM
- Docker networking
- Docker Compose service orchestration
- Security middleware
- Rate limiting
- Centralized error handling
- API integration testing
- OpenAPI documentation

One of the main lessons from the project was that authentication is not
a single endpoint. It is a system involving credential validation,
password storage, session lifecycle, client state, persistence, security
controls, and failure handling.

## Future Improvements

Possible future extensions include:

- Email verification
- Password reset
- OAuth authentication
- Two-factor authentication
- Account lockout policies
- More granular authorization and roles
- Structured application logging
- Monitoring and observability
- Production deployment configuration

## License

This project is primarily intended as a learning and portfolio project.
