# Task Manager App

A simple full-stack task manager with:
- **Backend**: Node.js + Express REST API, documented with **Swagger UI**
- **Frontend**: Plain HTML/CSS/JavaScript (no build step needed)

## Project Structure
```
task-manager-app/
├── backend/
│   ├── server.js        # Express app entry point
│   ├── swagger.js        # Swagger/OpenAPI config
│   ├── routes/tasks.js    # Task CRUD routes (annotated for Swagger)
│   └── package.json
└── frontend/
    ├── index.html
    ├── style.css
    └── script.js
```

## 1. Run the Backend

```bash
cd backend
npm install
npm start
```

The API will start on **http://localhost:4000**.

- API base URL: `http://localhost:4000/api/tasks`
- **Swagger UI**: `http://localhost:4000/api-docs`
- Raw OpenAPI JSON: `http://localhost:4000/api-docs.json`

### API Endpoints
| Method | Endpoint          | Description         |
|--------|-------------------|----------------------|
| GET    | /api/tasks        | List all tasks       |
| GET    | /api/tasks/:id    | Get a single task    |
| POST   | /api/tasks        | Create a task         |
| PUT    | /api/tasks/:id    | Update a task         |
| DELETE | /api/tasks/:id    | Delete a task         |

## 2. Run the Frontend

The frontend is static — no build tools required. Simplest way to serve it:

```bash
cd frontend
npx serve .
```

Or just open `frontend/index.html` directly in your browser (the backend has CORS enabled, so it'll work either way). Make sure the backend is running first, since the frontend calls `http://localhost:4000/api`.

## Notes
- Data is stored **in memory** on the backend — it resets whenever the server restarts. Swap the array in `routes/tasks.js` for a real database (e.g. PostgreSQL, MongoDB) for persistence.
- To change the backend port, set the `PORT` environment variable before running `npm start`.
- The frontend's `API_BASE` constant in `script.js` assumes the backend runs on `localhost:4000` — update it if you change the port or deploy elsewhere.
