# Tasks CRUD: how the app works

Tasks are stored in PostgreSQL. The Angular page talks to the NestJS API; NgRx holds the latest response in browser memory so the page can render and update predictably.

## Request flow

1. `Tasks` dispatches an NgRx action when the page loads or a user creates, edits, completes, or deletes a task.
2. `TasksEffects` catches that action and calls `TasksApiService`.
3. `TasksApiService` sends an HTTP request to the NestJS `/tasks` endpoint.
4. `TasksController` validates and routes the request to `TasksService`.
5. `TasksService` reads or writes the `tasks` PostgreSQL table through a TypeORM repository.
6. The API response becomes a success action. The reducer applies the returned database task to NgRx state, and the template updates.

The effect reports failed requests as `taskRequestFailure`; the reducer stores the message for the existing error display. A task only appears in the list after the server confirms the write.

## API

| Method | Path | Purpose | Body |
| --- | --- | --- | --- |
| `GET` | `/tasks` | List tasks | — |
| `POST` | `/tasks` | Create a task | `{ "title": "Read a chapter" }` |
| `PATCH` | `/tasks/:id` | Change title and/or completion | `{ "completed": true }` |
| `DELETE` | `/tasks/:id` | Delete a task | — |

Tasks have a `todo`, `in-progress`, or `done` status. The board lets users drag cards between columns or use the move buttons. The API validates task titles (1–255 characters), returns 404 for a missing task update/delete, and returns 204 after a successful delete. Tasks currently belong to the whole application; there is no authentication or per-user ownership implemented.

## Database and local setup

`server/src/database/entities/task.entity.ts` defines the TypeORM entity. The initial migration creates the task and user tables when they do not exist; `1793303819480-AddTaskStatus.ts` adds the board status and converts previously completed tasks to `done`. TypeORM runs pending migrations when the NestJS app starts (`migrationsRun: true`):

```sh
cd server
npm run start:dev
```

The NestJS API reads `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`. The Angular service currently targets `http://localhost:3000/tasks`; update that URL for a different API host. The API permits the Angular development origin `http://localhost:4200` through CORS.

## Main files

- Backend entity and migrations: `server/src/database/entities/task.entity.ts`, `server/src/database/migrations/`
- Backend HTTP and database layers: `server/src/modules/tasks/`
- Angular HTTP client: `client/src/app/store/tasks/tasks-api.service.ts`
- NgRx actions, effects, and state: `client/src/app/store/tasks/`
- UI handlers and controls: `client/src/app/features/tasks/tasks.ts`, `tasks.html`
