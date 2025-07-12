const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db-tasks.json");
const middlewares = jsonServer.defaults();

// Middleware setup
server.use(middlewares);
server.use(jsonServer.bodyParser);

// ✅ Valid enums
const validStatus = ["todo", "in-progress", "done", "canceled"];
const validPriority = ["low", "medium", "high"];
const validLabel = ["bug", "feature", "enhancement", "documentation"];


// 🔢 Auto ID generator
function getNextTaskNumber(db) {
  const tasks = db.get("tasks").value() || [];
  const ids = tasks.map((t) => {
    const match = typeof t.id === "string" && t.id.match(/^task_(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
  });
  return ids.length ? Math.max(...ids) + 1 : 1;
}

server.get("/task-statuses", (req, res) => {
  res.json(["todo", "in-progress", "done", "canceled"]);
});

server.get("/task-priorities", (req, res) => {
  res.json(["low", "medium", "high"]);
});

server.get("/task-labels", (req, res) => {
  res.json(["bug", "feature", "enhancement", "documentation"]);
});


// ✅ POST /tasks — enrich + validate
server.post("/tasks", (req, res, next) => {
  if (!req.body || typeof req.body !== "object") return next();

  // Reject invalid enums
  if (!validStatus.includes(req.body.status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatus.join(", ")}` });
  }

  if (!validPriority.includes(req.body.priority)) {
    return res.status(400).json({ error: `Invalid priority. Must be one of: ${validPriority.join(", ")}` });
  }

  /* - Default Approach : Issue Doesnt response attributed in order 
  const db = router.db;
  const nextNum = getNextTaskNumber(db);
  req.body.id = `task_${nextNum}`;
  req.body.code = `TKT-${1000 + nextNum}`;
  req.body.status = req.body.status || "todo";
  req.body.priority = req.body.priority || "low";
  req.body.label = req.body.label || "bug";
  req.body.createdAt = new Date().toISOString();
  req.body.updatedAt = "";
  next(); */

  /** 2nd Approach */
  const db = router.db;
  const nextNum = getNextTaskNumber(db);
  const now = new Date().toISOString();

  const task = {
    id: `${nextNum}`,
    code: `TKT-${1000 + nextNum}`,
    title: req.body.title,
    status: req.body.status || "todo",
    label: req.body.label || "bug",
    priority: req.body.priority || "low",
    estimatedHours: req.body.estimatedHours ?? 0,
    archived: req.body.archived ?? false,
    createdAt: now,
    updatedAt: ""
  };

  db.get("tasks").push(task).write(); // manually insert into db
  return res.status(201).json(task);  // controlled response order
});

// ✅ PUT/PATCH — update timestamp + validate enums
server.use((req, res, next) => {
  if (["PUT", "PATCH"].includes(req.method) && req.body && typeof req.body === "object") {
    req.body.updatedAt = new Date().toISOString();

    if (req.body.status && !validStatus.includes(req.body.status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatus.join(", ")}` });
    }

    if (req.body.priority && !validPriority.includes(req.body.priority)) {
      return res.status(400).json({ error: `Invalid priority. Must be one of: ${validPriority.join(", ")}` });
    }
  }

  next();
});

server.use(router);

server.listen(7000, () => {
  console.log("✅ Tasks JSON Server is running at http://localhost:7000");
});
