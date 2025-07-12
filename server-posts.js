  const jsonServer = require("json-server");
  const server = jsonServer.create();
  const router = jsonServer.router("db-posts.json");
  const middlewares = jsonServer.defaults();

  server.use(middlewares);
  server.use(jsonServer.bodyParser);

  const validPostStatus = ["draft", "published", "archived"];

  function getNextId(collection) {
    const items = router.db.get(collection).value() || [];
    const ids = items.map(item => typeof item.id === "number" ? item.id : 0);
    return ids.length ? Math.max(...ids) + 1 : 1;
  }

  // ✅ POST /posts
  server.post("/posts", (req, res) => {
    if (!req.body || typeof req.body !== "object") return res.sendStatus(400);

    if (!validPostStatus.includes(req.body.status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validPostStatus.join(", ")}` });
    }

    const userExists = router.db.get("users").find({ id: req.body.userId }).value();
    const categoryExists = router.db.get("categories").find({ id: req.body.categoryId }).value();

    if (!userExists || !categoryExists) {
      return res.status(400).json({ error: "Invalid userId or categoryId" });
    }

    const now = new Date().toISOString();
    const post = {
      id: getNextId("posts"),
      title: req.body.title,
      content: req.body.content,
      userId: req.body.userId,
      categoryId: req.body.categoryId,
      status: req.body.status,
      createdAt: now,
      updatedAt: now
    };

    router.db.get("posts").push(post).write(); // manually insert into db ::: Custom Save not using next() [Default Method]
    res.status(201).json(post);  // controlled response order
  });

  // ✅ PUT/PATCH /posts — updatedAt + status validation
  server.use((req, res, next) => {
    if (["PUT", "PATCH"].includes(req.method) && req.body && typeof req.body === "object") {
      req.body.updatedAt = new Date().toISOString();

      if (req.body.status && !validPostStatus.includes(req.body.status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${validPostStatus.join(", ")}` });
      }

      if (req.body.userId || req.body.categoryId) {
        const userExists = router.db.get("users").find({ id: req.body.userId }).value();
        const categoryExists = router.db.get("categories").find({ id: req.body.categoryId }).value();

        if (!userExists || !categoryExists) {
          return res.status(400).json({ error: "Invalid userId or categoryId" });
        }
      }
    }
    next();
  });

  // ✅ POST /users — auto ID + unique email
  server.post("/users", (req, res, next) => {
    if (!req.body || typeof req.body !== "object") return next();

    const email = (req.body.email || "").toLowerCase();
    const users = router.db.get("users");
    const exists = users.find(u => (u.email || "").toLowerCase() === email).value();

    if (exists) {
      return res.status(400).json({ error: "Email already exists." });
    }

    const now = new Date().toISOString();
    req.body.id = getNextId("users");
    req.body.createdAt = now;
    req.body.updatedAt = now;

    next();
  });

  // ✅ POST /categories — auto ID + timestamps
  server.post("/categories", (req, res, next) => {
    if (!req.body || typeof req.body !== "object") return next();

    const now = new Date().toISOString();
    req.body.id = getNextId("categories");
    req.body.createdAt = now;
    req.body.updatedAt = now;

    next();
  });

  server.use(router);
  server.listen(7001, () => {
    console.log("✅ Posts JSON Server is running at http://localhost:7001");
  });
