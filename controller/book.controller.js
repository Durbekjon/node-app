// book.controller.js
const fs = require('fs')
const path = require('path')

const getAll = () => {
  try {
    const data = fs.readFileSync(
      path.join(__dirname, '..', 'model', 'books.json'),
      'utf-8'
    )
    return data
  } catch (error) {
    console.error('Error reading the book data:', error)
    return JSON.stringify({ error: 'Failed to read the book data' })
  }
}

module.exports = { getAll }
