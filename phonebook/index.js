require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");
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

let persons = [];

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
  Person.find({}).then((people) => {
    response.json(people);
  });
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => response.json(person))
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
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

  const person = new Person({
    name: newName,
    number: newNumber,
  });

  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  person = {
    name: body.name,
    number: body.number,
  };

  Person
    .findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }
  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
