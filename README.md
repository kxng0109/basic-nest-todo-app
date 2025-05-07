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
   git clone <repo-url>
   cd <project-directory>
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
     DATABASE_URL="file:./prisma/dev.db"
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
    completed: boolean;
  }
  ```

* **`UpdateTodoDto`**

  ```ts
  import { PartialType } from "@nestjs/mapped-types";
  import { CreateTodoDto } from "./create-todo.dto";

  export class UpdateTodoDto extends PartialType(CreateTodoDto) {}
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
  completed   Boolean  @default(false)
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

## License

This project is MIT licensed. You are free to use and modify it as needed.
