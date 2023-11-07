const fs = require('fs')
const path = require('path')
const http = require('http')

const dataPath = path.join(__dirname, 'model', 'books.json')

const server = http.createServer((req, res) => {
  const method = req.method
  const url = req.url
  const param = url.split('/')
  const id = param[2]

  if (method === 'GET' && url === '/books') {
    const books = fs.readFileSync(dataPath, 'utf-8')
    res.end(books)
  } else if (method === 'GET' && url.startsWith('/books/')) {
    const books = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
    const foundBook = books.find((book) => book.id === Number(id))
    if (foundBook) {
      res.end(JSON.stringify(foundBook))
    } else {
      res.statusCode = 404
      res.end('Bunday kitob topilmadi')
    }
  } else if (method === 'POST' && url === '/books') {
    let body = []
    req.on('data', (chunk) => {
      body.push(chunk)
    })
    req.on('end', () => {
      const parsedBody = Buffer.concat(body).toString()
      const newBook = JSON.parse(parsedBody)
      const books = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
      const existingBook = books.find((book) => book.title === newBook.title)
      if (existingBook) {
        res.statusCode = 400
        res.end('Bu kitob bazada mavjud')
      } else {
        // Auto-generate the next ID
        const maxId = Math.max(...books.map((book) => book.id), 0)
        newBook.id = maxId + 1
        books.push(newBook)
        fs.writeFileSync(dataPath, JSON.stringify(books, null, 2))
        res.end("Kitob qo'shildi")
      }
    })
  } else if (method === 'PUT' && url.startsWith('/books/')) {
    const books = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
    const foundBookIndex = books.findIndex((book) => book.id === Number(id))

    if (foundBookIndex !== -1) {
      let body = []
      req.on('data', (chunk) => {
        body.push(chunk)
      })
      req.on('end', () => {
        const parsedBody = Buffer.concat(body).toString()
        const updatedBook = JSON.parse(parsedBody)
        books[foundBookIndex] = { ...books[foundBookIndex], ...updatedBook }
        fs.writeFileSync(dataPath, JSON.stringify(books, null, 2))
        res.end('Kitob tahrirlandi')
      })
    } else {
      res.statusCode = 404
      res.end('Bunday kitob topilmadi')
    }
  } else if (method === 'DELETE' && url.startsWith('/books/')) {
    const books = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
    const foundBookIndex = books.findIndex((book) => book.id === Number(id))

    if (foundBookIndex !== -1) {
      books.splice(foundBookIndex, 1)
      fs.writeFileSync(dataPath, JSON.stringify(books, null, 2))
      res.end("Kitob o'chirildi")
    } else {
      res.statusCode = 404
      res.end('Bunday kitob topilmadi')
    }
  }
})

const PORT = 3000

server.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT)
})
