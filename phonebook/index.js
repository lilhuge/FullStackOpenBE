const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

morgan.token("requestBody", (req, res) => {
  const body = JSON.stringify(req.body);
  if (body === "{}") return null;
  return body;
});
const loggerFunction = (tokens, req, res) =>
  [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, "content-length"),
    "-",
    tokens["response-time"](req, res),
    "ms",
    tokens.requestBody(req, res),
  ].join(" ");

app.use(express.static("build"));
app.use(cors());
app.use(express.json());
app.use(morgan(loggerFunction));

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/info", (request, response) => {
  const personsCount = persons.length;
  const date = new Date();
  const htmlString = `
  <p>Phonebook has info for ${personsCount} people</p>
  <p>${new Date()}</p>
  `;
  response.set("Content-Type", "text/html");
  response.send(htmlString);
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);

  const person = persons.find((person) => person.id === id);
  console.log(person);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

app.post("/api/persons", (request, response) => {
  const body = request?.body;
  if (!body) {
    return response.status(400).json({
      error: "content missing",
    });
  }
  const newName = request?.body?.name;
  if (!newName) {
    return response.status(400).json({
      error: "name missing",
    });
  }
  const newNumber = request?.body?.number;
  if (!newNumber) {
    return response.status(400).json({
      error: "number missing",
    });
  }
  const nameExists = persons.reduce(
    (acc, person) => person.name === newName || acc,
    false
  );
  if (nameExists) {
    return response.status(400).json({
      error: "contact with this name already exists",
    });
  }
  console.log(Math.floor(Math.random() * 999999));
  const newPerson = {
    id: Math.floor(Math.random() * 999999),
    name: body.name,
    number: body.number,
  };
  console.log(newPerson);

  persons = persons.concat(newPerson);
  response.json(newPerson);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
