# 🛠️ Mock APIs with JSON Server

A lightweight mock API setup using [JSON Server](https://github.com/typicode/json-server) to simulate `tasks` and `posts` RESTful endpoints with enriched behavior, validation, and ID generation.

## 📦 Project Structure

```
mock-apis-json-server/
├── db-posts.json         # Database for posts, users, and categories
├── db-tasks.json         # Database for tasks
├── server-posts.js       # Custom JSON server for posts module
├── server-tasks.js       # Custom JSON server for tasks module
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 📋 Prerequisites

- Node.js >= 14.x
- npm

### 📦 Install Dependencies

```bash
npm install
```

---

## 🧪 Run Mock Servers

### ✅ Tasks Server

```bash
npm run start:tasks
```

- URL: `http://localhost:7000/tasks`
- Valid `status`: `todo`, `in-progress`, `done`, `canceled`
- Valid `priority`: `low`, `medium`, `high`
- Auto-generates:
  - `id`
  - `code` as `TKT-1000+`
  - `createdAt`, `updatedAt` timestamps

### ✅ Posts Server

```bash
npm run start:posts
```

- URL: `http://localhost:7001/posts`
- Valid `status`: `draft`, `published`, `archived`
- Validates:
  - `userId` must exist in `users`
  - `categoryId` must exist in `categories`
- Endpoints:
  - `POST /posts`
  - `POST /users` (auto ID + unique email)
  - `POST /categories` (auto ID + timestamps)
  - `PUT/PATCH /posts` — status & reference validation

### ▶️ Run Both Simultaneously

```bash
npm run start:all
```

---

## 🔧 Features

### 📌 Tasks API

- `POST /tasks`: Validates enums, auto-generates ID and code
- `PUT/PATCH /tasks`: Auto-updates `updatedAt`, validates fields

### 📝 Posts API

- `POST /posts`: Validates status, userId, and categoryId
- `POST /users`: Auto ID, unique email check
- `POST /categories`: Auto ID, timestamps
- `PUT/PATCH /posts`: Validates status and references, auto `updatedAt`

---

## 📚 Dependencies

- [`json-server`](https://www.npmjs.com/package/json-server)
- [`concurrently`](https://www.npmjs.com/package/concurrently)

---

## 📍 Ports

| Module | Port  | Description         |
|--------|-------|---------------------|
| Tasks  | 7000  | Task management API |
| Posts  | 7001  | Blog/post API       |


