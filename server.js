import express from 'express'
import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'
import cookieParser from 'cookie-parser'

const app = express()

// Express Config:
app.use(express.static('public'))
app.use(cookieParser())

// app.get('/', (req, res) => res.send('Hello there'))

const port = 3030
app.listen(port, () =>
  loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
)

// Express Routing:
// Get Bugs (READ)
app.get('/api/bug', (req, res) => {
  bugService
    .query()
    .then((bugs) => res.send(bugs))
    .catch((err) => {
      loggerService.error('Cannot get bugs', err)
      res.status(400).send('Cannot get bugs')
    })
})

app.get('/api/bug/save', (req, res) => {
  const bugToSave = {
    _id: req.query._id,
    title: req.query.title,
    description: req.query.description,
    severity: req.query.severity,
    createdAt: new Date(),
  }

  bugService
    .save(bugToSave)
    .then((bug) => res.send(bug))
    .catch((err) => {
      loggerService.error('Cannot save bug')
      res.status(400).send('Cannot save bug')
    })
})

// Get a specific Bug (READ)
app.get('/api/bug/:id', (req, res) => {
  const bugId = req.params.id
  const visitedBugs = req.cookies.visitedBugs
    ? JSON.parse(req.cookies.visitedBugs)
    : []

  if (visitedBugs.length >= 3) {
    return res.status(401).send('Wait for a bit')
  }

  if (!visitedBugs.includes(bugId)) {
    visitedBugs.push(bugId)
    res.cookie('visitedBugs', JSON.stringify(visitedBugs), { maxAge: 7000 })
  }

  console.log('User visited the following bugs:', visitedBugs)

  bugService
    .getById(bugId)
    .then((bug) => res.send(bug))
    .catch((err) => {
      loggerService.error('Cannot get bug', err)
      res.status(400).send('Cannot get bug')
    })
})

app.get('/api/bug/:id/remove', (req, res) => {
  const bugId = req.params.id
  bugService
    .remove(bugId)
    .then(() => res.send(bugId))
    .catch((err) => {
      loggerService.error('Cannot remove bug', err)
      res.status(400).send('Cannot get bug')
    })
})
