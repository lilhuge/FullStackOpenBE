const mongoose = require("mongoose");

if (
  process.argv.length < 3 ||
  process.argv.length === 4 ||
  process.argv.length > 5
) {
  console.log(
    `Please provide correct number of arguments. Must include password. 2 Optional extra arguments needed to create new contact: 
    node mongo.js <password> ||  node mongo.js <password> <name> <number>`
  );
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://lilhuge:${password}@cluster0.svks7mm.mongodb.net/phonebookApp?retryWrites=true&w=majority`;

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

mongoose.connect(url).then((result) => {
  console.log("connected");
});

if (process.argv.length === 3) {
  Person.find({})
    .then((result) => {
      result.forEach((person) => {
        console.log(person);
      });
      mongoose.connection.close();
    })
    .catch((err) => console.log(err));
}

if (process.argv.length === 5) {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  });
  return person
    .save()
    .then(() => {
      console.log("contact saved!");
      return mongoose.connection.close();
    })
    .catch((err) => console.log(err));
}
