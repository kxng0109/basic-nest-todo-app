# Todo List API (NestJS + Prisma + SQLite)

A simple **Todo List** REST API built with [NestJS](https://nestjs.com/), using [Prisma](https://www.prisma.io/) as the ORM and **SQLite** as the database.

---

## Prerequisites

* **Node.js** 
* **npm** or **Yarn**

---

## Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/kxng0109/basic-nest-todo-app.git
   cd basic-nest-todo-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up the SQLite database and Prisma client**

   * Create a `.env` file in the root directory with the following content:

     ```env
     DATABASE_URL="file:./dev.db"
     ```

   * Generate the Prisma client:

     ```bash
     npx prisma generate
     ```

   * Run the initial migration:

     ```bash
     npx prisma migrate dev --name init
     ```

---

## Running the Application

Start the development server:

```bash
npm run start:dev
# or
yarn start:dev
```

The server runs by default at **`http://localhost:3000`**.

---

## API Endpoints

Base URL: `http://localhost:3000/todo`

| Method | Endpoint    | Description             | Request Body                                                          |
| ------ | ----------- | ----------------------- | --------------------------------------------------------------------- |
| POST   | `/todo`     | Create a new Todo       | `{ "title": string, "description"?: string, "completed"?: boolean }`  |
| GET    | `/todo`     | Get all Todos           | —                                                                     |
| GET    | `/todo/:id` | Get a single Todo by ID | —                                                                     |
| PATCH  | `/todo/:id` | Update a Todo           | `{ "title"?: string, "description"?: string, "completed"?: boolean }` |
| DELETE | `/todo/:id` | Delete a Todo           | —                                                                     |

---

## DTOs & Validation

Validation is handled using `class-validator`.

* **`CreateTodoDto`**

  ```ts
  import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

  export class CreateTodoDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsBoolean()
    @IsOptional()
    completed?: boolean;
  }
  ```

* **`UpdateTodoDto`**

  ```ts
  import { PartialType } from "@nestjs/mapped-types";
  import { CreateTodoDto } from "./create-todo.dto";

  export class UpdateTodoDto extends PartialType(CreateTodoDto) {}
  ```

Ensure the global `ValidationPipe` is enabled in `main.ts`:

```ts
app.useGlobalPipes(
  new ValidationPipe({ whitelist: true }),
);
```

---

## Error Handling

Simple error handling has been implemented in the service layer:

* Prevents creation or update of a todo with a duplicate `title`.
* Returns a `BadRequestException` if a todo with the given title already exists.
* Throws a `NotFoundException` if attempting to access or delete a non-existent todo.

---

## Prisma Schema Overview

```prisma
model Todo {
  id          Int      @default(autoincrement()) @id
  title       String   @unique
  description String?
  completed   Boolean?  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @default(now()) @updatedAt
}
```

Datasource and generator configuration:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

---

## End-to-End Testing

This project includes a suite of end-to-end (E2E) tests using [Pactum](https://pactumjs.github.io/) and Jest. These tests run against an isolated SQLite database defined in `.env.test`, ensuring your development data remains untouched.

### Test Database Configuration

1. Create or update the `.env.test` file at project root:

   ```env
   DATABASE_URL="file:./test.db"
   ```
2. No migrations are required for the test database; it will be synchronized to match the Prisma schema automatically.

### NPM Scripts

The following scripts have been added to `package.json`:

```json
{
  "scripts": {
    "pretest:e2e": "npx dotenv -e .env.test -- prisma db push",
    "test:e2e": "npx dotenv -e .env.test -- jest --no-cache --config ./test/jest-e2e.json"
  }
}
```

* **`npm run pretest:e2e`**: Pushes the current Prisma schema into `test.db` (creating or resetting it).
* **`npm run test:e2e`**: Loads `.env.test`, then runs the Jest E2E test suite without cache.

### How the Test File Works

The primary E2E spec lives in `test/app.e2e-spec.ts`. Key points:

* **Bootstrapping**: A separate Nest application instance is started on port `3001` with global validation enabled.
* **Database cleanup**: Before tests run, the `prisma.todo.deleteMany()` call clears any existing records.
* **Pactum requests**: Tests use `pactum.spec()` to send HTTP requests to `/todo`, asserting on status codes, response bodies, and JSON matches.
* **Path parameters and state**: The first created Todo ID is stored (`.stores('todoId', 'id')`) to parameterize subsequent GET, PATCH, and DELETE requests.

To run the full suite, simply:

```bash
npm run pretest:e2e
npm run test:e2e
```

---

## License

This project is MIT licensed. You are free to use and modify it as needed.
