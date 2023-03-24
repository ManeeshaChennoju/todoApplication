const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// .................................................
// .................................................

const checkPriorityAndStatus = (status, priority) => {
  return priority !== undefined && status !== undefined;
};

const checkHasPriority = (priority) => {
  return priority !== undefined;
};

const checkHasStatus = (status) => {
  return status !== undefined;
};

const getQuery = (status, priority, search_q) => {
  let query = "";
  switch (true) {
    case checkPriorityAndStatus(status, priority, search_q):
      query = `SELECT * FROM todo
                      WHERE status = '${status}'
                      AND priority = '${priority}'
                      AND todo LIKE '%${search_q}%';`;
      break;

    case checkHasPriority(priority, search_q):
      query = `SELECT * FROM todo
                      WHERE priority = '${priority}'
                      AND todo LIKE '%${search_q}%';`;
      break;

    case checkHasStatus(status, search_q):
      query = `SELECT * FROM todo
                      WHERE status = '${status}'
                      AND todo LIKE '%${search_q}%';`;
      break;

    default:
      query = `SELECT * FROM todo
                      WHERE todo LIKE '%${search_q}%';`;
      break;
  }
  return query;
};
// .................................................

const isStatusPriorityTodo = (status, priority, todo) => {
  return status !== undefined && priority !== undefined && todo !== undefined;
};

const isStatusPriority = (status, priority) => {
  return status !== undefined && priority !== undefined;
};

const isStatusTodo = (status, todo) => {
  return status !== undefined && todo !== undefined;
};

const isPriorityTodo = (priority, todo) => {
  return priority !== undefined && todo !== undefined;
};

const isStatus = (status) => {
  return status !== undefined;
};

const isPriority = (priority) => {
  return priority !== undefined;
};

const isTodo = (todo) => {
  return todo !== undefined;
};

const UpdateQuery = (todoId, status, priority, todo) => {
  let Query = [];
  switch (true) {
    case isStatusPriorityTodo(status, priority, todo):
      Query[0] = `UPDATE todo
                   SET status = '${status}',
                    priority = '${priority}',
                    todo = '${todo}'
                    WHERE id = ${todoId};`;

      Query[1] = `Status Priority Todo Updated`;
      break;

    case isStatusPriority(status, priority):
      Query[0] = `UPDATE todo
                   SET status = '${status}',
                   priority = '${priority}'
                     WHERE id = ${todoId};`;

      Query[1] = `Status Priority Updated`;
      break;

    case isStatusTodo(status, todo):
      Query[0] = `UPDATE todo
                   SET status = '${status}',
                    todo = '${todo}'
                     WHERE id = ${todoId};`;

      Query[1] = `Status Todo Updated`;
      break;

    case isPriorityTodo(priority, todo):
      Query[0] = `UPDATE todo
                    SET priority = '${priority}',
                    todo = '${todo}'
                     WHERE id = ${todoId};`;

      Query[1] = `Priority Todo Updated`;
      break;
    case isStatus(status):
      Query[0] = `UPDATE todo
                   SET status = '${status}'
                    WHERE id = ${todoId};`;

      Query[1] = `Status Updated`;
      break;

    case isPriority(priority):
      Query[0] = `UPDATE todo
                    SET
                    priority = '${priority}'
                     WHERE id = ${todoId};`;

      Query[1] = `Priority Updated`;
      break;

    case isTodo(todo):
      Query[0] = `UPDATE todo
                    SET todo = '${todo}'
                     WHERE id = ${todoId};`;

      Query[1] = `Todo Updated`;
      break;

    default:
      Query[0] = "";

      Query[1] = "Please Provide Any Details To Update..........";

      break;
  }

  return Query;
};
// .................................................
// .................................................

app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "" } = request.query;
  const getAllTodoQuery = getQuery(status, priority, search_q);
  const getTodoArray = await db.all(getAllTodoQuery);
  response.send(getTodoArray);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `SELECT * FROM todo WHERE id = ${todoId};`;
  const todoArray = await db.get(getTodoQuery);
  response.send(todoArray);
});

app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;
  const addTodoQuery = `INSERT INTO todo(id, todo,priority,status)
                        VALUES('${id}', '${todo}', '${priority}', '${status}');`;
  const dbResponse = await db.run(addTodoQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo } = request.body;
  const resultArray = UpdateQuery(todoId, status, priority, todo);
  const updateTodoQuery = resultArray[0];
  const resultMessage = resultArray[1];
  if (UpdateQuery !== "") {
    const dbResponse = await db.run(updateTodoQuery);
  }
  response.send(resultMessage);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `DELETE FROM todo 
                            WHERE id = ${todoId};`;
  const dbResponse = await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
