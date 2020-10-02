const express = require('express')
const app = express()
const port = 3000

app.use(express.static(__dirname))

// routes
const routes = [
  '/',
  '/about',
]

routes.forEach(route => app.get(route, (req, res) => res.sendFile(__dirname + '/demo/demo.html')))

app.listen(port, () => console.log(`listening on port ${port}!`))
