const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db-users-roles-countries.json");
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Allowed values
const validStatuses = ["active", "inactive", "suspended"];

// Helper: Next ID
function getNextId(collection) {
  const items = router.db.get(collection).value() || [];
  const ids = items.map(item => typeof item.id === "number" ? item.id : 0);
  return ids.length ? Math.max(...ids) + 1 : 1;
}

// ✅ POST /users — auto ID, timestamps, unique email, foreign key check
server.post("/users", (req, res, next) => {
  if (!req.body || typeof req.body !== "object") return res.sendStatus(400);

  const email = (req.body.email || "").toLowerCase();
  const exists = router.db.get("users").find(u => (u.email || "").toLowerCase() === email).value();
  if (exists) return res.status(400).json({ error: "Email already exists." });

  if (req.body.status && !validStatuses.includes(req.body.status)) {
    return res.status(400).json({ error: `Invalid status. Use one of: ${validStatuses.join(", ")}` });
  }

  const role = router.db.get("roles").find({ id: req.body.roleId }).value();
  const country = router.db.get("countries").find({ id: req.body.countryId }).value();
  if (!role || !country) {
    return res.status(400).json({ error: "Invalid roleId or countryId" });
  }

  const now = new Date().toISOString();
  req.body.id = getNextId("users");
  req.body.createdAt = now;
  req.body.updatedAt = now;

  next();
});

// ✅ PATCH /users — validate status and foreign keys
server.use((req, res, next) => {
  if (["PUT", "PATCH"].includes(req.method) && req.path.startsWith("/users") && req.body) {
    req.body.updatedAt = new Date().toISOString();

    if (req.body.status && !validStatuses.includes(req.body.status)) {
      return res.status(400).json({ error: `Invalid status. Use one of: ${validStatuses.join(", ")}` });
    }

    if (req.body.roleId) {
      const role = router.db.get("roles").find({ id: req.body.roleId }).value();
      if (!role) return res.status(400).json({ error: "Invalid roleId" });
    }

    if (req.body.countryId) {
      const country = router.db.get("countries").find({ id: req.body.countryId }).value();
      if (!country) return res.status(400).json({ error: "Invalid countryId" });
    }
  }
  next();
});

// ✅ POST /roles — auto ID
server.post("/roles", (req, res, next) => {
  if (!req.body || typeof req.body !== "object") return next();
  req.body.id = getNextId("roles");
  next();
});

// ✅ POST /countries — auto ID
server.post("/countries", (req, res, next) => {
  if (!req.body || typeof req.body !== "object") return next();
  req.body.id = getNextId("countries");
  next();
});

server.use(router);

server.listen(7002, () => {
  console.log("✅ Users JSON Server is running at http://localhost:7002");
});
