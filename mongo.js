/* eslint-disable no-undef */
const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log(
    'Please provide the password as an argument: node mongo.js <password>'
  )
  process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://fsopen:${password}@cluster0.gmeokla.mongodb.net/phonebookApp?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema({
  id: Number,
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  mongoose
    .connect(url)
    .then(() => {
      console.log('phonebook:')

      Person.find({}).then((result) => {
        result.forEach((person) => {
          console.log(person.name, person.number)
        })
        mongoose.connection.close()
      })
    })
    .catch((err) => console.log(err))
}

if (process.argv.length > 4) {
  mongoose
    .connect(url)
    .then(() => {
      console.log('connected')

      const person = new Person({
        id: Math.floor(Math.random() * 10000),
        name: process.argv[3],
        number: process.argv[4],
      })

      return person.save()
    })
    .then(() => {
      console.log(
        `Added ${process.argv[3]} number ${process.argv[4]} to phonebook`
      )
      return mongoose.connection.close()
    })
    .catch((err) => console.log(err))
}
