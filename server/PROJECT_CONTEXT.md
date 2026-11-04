# Server project context

Last updated: 2026-10-28.

## Stack and structure

- NestJS 12, TypeScript with ESM/NodeNext, PostgreSQL, TypeORM, Joi, and Vitest.
- `src/main.ts` configures CORS for the Angular development server and installs the global validation pipe.
- `src/app.module.ts` loads configuration, the global TypeORM database module, users, and tasks modules.
- `src/database/entities/` contains `UserEntity` and `TaskEntity`.
- `src/database/migrations/` contains a TypeORM migration for the initial users/tasks tables. Pending migrations run at application startup; schema synchronization is disabled.
- `src/modules/users/` and `src/modules/tasks/` contain controllers, DTOs, and services that use TypeORM repositories.

## Database configuration

The app reads `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`. The Joi config also currently requires `REDIS_HOST` and `REDIS_PORT`, although Redis is not connected. Migration execution requires PostgreSQL to be reachable at startup.

The migration creates missing `users` and `tasks` tables with `IF NOT EXISTS`, preserving existing rows. Tasks are currently shared across the app because authentication and user ownership are not implemented.

## HTTP routes

| Method | Path | Behavior |
| --- | --- | --- |
| `POST` | `/users` | Create a user, hashing the password with bcrypt |
| `GET` | `/users/:id` | Find a user by UUID |
| `PATCH` | `/users/:id` | Partially update name, email, or last name |
| `PUT` | `/users/:id` | Replace the user fields |
| `GET` | `/tasks` | List tasks |
| `POST` | `/tasks` | Create a task |
| `PATCH` | `/tasks/:id` | Update title and/or completion |
| `DELETE` | `/tasks/:id` | Delete a task |

`GET /users?page=...&limit=...` currently echoes query values and does not paginate. User debug routes are also present under `/users/debug/*`.

## Local commands

Run from `server/`:

```sh
npm install
npm run start:dev
npm run build
npm run test
```

Provide the required environment variables in `.env`; never commit credentials. The frontend task service points at `http://localhost:3000/tasks` and the backend allows `http://localhost:4200` through CORS.

## Verification notes

The TypeScript/Nest build passed after the TypeORM migration. The database connection and startup migration still need to be confirmed against the user's configured PostgreSQL instance. Unit tests were not run during the ORM conversion.
