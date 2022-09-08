const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const Person = require("./models/person");

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

app.use(express.json());
app.use(requestLogger);
app.use(cors());
app.use(express.static("build"));

app.use(
  morgan("tiny", {
    skip: function (req, res) {
      return req.method === "POST";
    },
  })
);

morgan.token("body", (req, res) => req.body && JSON.stringify(req.body));

app.use(
  morgan(
    ":method :url :status :response-time ms - :res[content-lenght] :body - :req[content-lenght]",
    {
      skip: function (req, res) {
        return req.method !== "POST";
      },
    }
  )
);

app.get("/api/persons", (req, res, next) => {
  Person.find({})
    .then((persons) => {
      res.json(persons);
    })
    .catch((error) => next(error));
});

app.get("/info", (request, response) => {
  const currentTime = new Date();
  Person.count({}, function (err, count) {
    response.send(
      `<p>Phonebook has info for ${count} people</p><p>${currentTime.toString()}</p>`
    );
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

app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  Person.findByIdAndUpdate(
    request.params.id,
    { $set: { name: person.name, number: person.number } },
    { new: true, runValidators: true, context: "query" }
  )
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
