const baseUrl = process.env.API_URL || "http://127.0.0.1:3000";

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };

  if (options.body && !Object.keys(headers).some((k) => k.toLowerCase() === "content-type")) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(baseUrl + path, {
    ...options,
    headers,
  });

  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  return { status: res.status, body };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function run() {
  const results = [];

  const email = `test_${Date.now()}@example.com`;
  const password = "Test@12345";

  let token;
  let projectId;
  let taskId;

  let res = await request("/");
  assert(res.status === 200, "GET / should return 200");
  results.push(["GET /", "pass"]);

  res = await request("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      name: "Smoke Test User",
      email,
      password,
    }),
  });
  assert(res.status === 201, "Signup should return 201");
  results.push(["POST /api/auth/signup", "pass"]);

  res = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
  assert(res.status === 200, "Login should return 200");
  assert(res.body?.token, "Login should return token");
  token = res.body.token;
  results.push(["POST /api/auth/login", "pass"]);

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  res = await request("/api/projects", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      name: "Smoke Test Project",
      description: "Created by smoke test",
    }),
  });
  assert(res.status === 201, "Create project should return 201");
  assert(res.body?.project?.id, "Project response should include id");
  projectId = res.body.project.id;
  results.push(["POST /api/projects", "pass"]);

  res = await request("/api/projects", {
    method: "GET",
    headers: authHeaders,
  });
  assert(res.status === 200, "GET /api/projects should return 200");
  assert(Array.isArray(res.body), "Projects response should be an array");
  results.push(["GET /api/projects", "pass"]);

  res = await request(`/api/projects/${projectId}`, {
    method: "GET",
    headers: authHeaders,
  });
  assert(res.status === 200, "GET /api/projects/:id should return 200");
  results.push(["GET /api/projects/:id", "pass"]);

  res = await request("/api/tasks", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      title: "Smoke Test Task",
      description: "Task created during smoke test",
      projectId,
    }),
  });
  assert(res.status === 201, "Create task should return 201");
  assert(res.body?.task?.id, "Task response should include id");
  taskId = res.body.task.id;
  results.push(["POST /api/tasks", "pass"]);

  res = await request(`/api/tasks/${taskId}/assign`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      assigneeIds: [1 , 2],
    }),
  });
  assert(res.status === 403 || res.status === 200, "Assign task should respond predictably");
  results.push([`POST /api/tasks/${taskId}/assign`, "pass"]);

  console.log("Smoke test results:");
  for (const [name, status] of results) {
    console.log(`${status.toUpperCase()} - ${name}`);
  }
}

run().catch((err) => {
  console.error("SMOKE TEST FAILED");
  console.error(err.message);
  process.exit(1);
});