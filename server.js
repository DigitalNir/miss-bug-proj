import path from 'path'
import express from 'express'
import cookieParser from 'cookie-parser'

import { bugService } from './services/bug.service.js'
import { userService } from './services/user.service.js'
import { loggerService } from './services/logger.service.js'

const app = express()

// Express Config:
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

// app.get('/', (req, res) => res.send('Hello there'))

const port = 3030
app.listen(port, () =>
  loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
)

// Express Routing:

// Get Bugs (READ)
app.get('/api/bug', (req, res) => {
  const filterBy = {
    title: req.query.title || '',
    severity: req.query.severity || 0,
    pageIdx: req.query.pageIdx,
    labels: req.query.labels,
  }

  // Check if labels exist and split into an array if it's a string
  if (req.query.labels) {
    filterBy.labels =
      typeof req.query.labels === 'string'
        ? req.query.labels.split(',')
        : req.query.labels
  }

  bugService
    .query(filterBy)
    .then((bugs) => res.send(bugs))
    .catch((err) => {
      loggerService.error('Cannot get bugs', err)
      res.status(400).send('Cannot get bugs')
    })
})

// Add Bug (CREATE)
app.post('/api/bug', (req, res) => {
  console.log('POST /api/bug request body:', req.body)
  const loggedinUser = userService.validateToken(req.cookies.loginToken)
  if (!loggedinUser) return res.status(401).send('Cannot add car')

  const bugToSave = {
    title: req.body.title,
    description: req.body.description,
    severity: req.body.severity,
    createdAt: new Date(),

    labels: req.body.labels,
  }

  bugService
    .save(bugToSave, loggedinUser)
    .then((bug) => res.send(bug))
    .catch((err) => {
      loggerService.error('Cannot save bug', err)
      res.status(400).send('Cannot save bug')
    })
})

// Edit Bug (UPDATE)
app.put('/api/bug', (req, res) => {
  console.log('PUT /api/bug request body:', req.body)

  const loggedinUser = userService.validateToken(req.cookies.loginToken)
  if (!loggedinUser) return res.status(401).send('Cannot update bug')
  const bugToSave = {
    _id: req.body._id,
    title: req.body.title,
    description: req.body.description,
    severity: req.body.severity,
    createdAt: new Date(),

    labels: req.body.labels,
  }

  bugService
    .save(bugToSave, loggedinUser)
    .then((bug) => res.send(bug))
    .catch((err) => {
      loggerService.error('Cannot save bug', err)
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

app.delete('/api/bug/:id', (req, res) => {
  console.log('DELETE /api/bug/:id/remove request params:', req.params)
  const loggedinUser = userService.validateToken(req.cookies.loginToken)
  if (!loggedinUser) res.status(401).send('Cannot remove bug')

  const bugId = req.params.id
  bugService
    .remove(bugId, loggedinUser)
    .then(() => res.send(bugId))
    .catch((err) => {
      loggerService.error('Cannot remove bug', err)
      res.status(400).send('Cannot get bug')
    })
})

// AUTH API
app.get('/api/user', (req, res) =>
  userService
    .query()
    .then((users) => res.send(users))
    .catch((err) => {
      console.log('Cannot load users', err)
      res.status(400).send('Cannot load users')
    })
)

app.post('/api/auth/login', (req, res) => {
  const credentials = req.body
  userService.checkLogin(credentials).then((user) => {
    if (user) {
      const loginToken = userService.getLoginToken(user)
      res.cookie('loginToken', loginToken)
      res.send(user)
    } else {
      res.status(401).send('Invalid credentials')
    }
  })
})

app.post('/api/auth/signup', (req, res) => {
  const credentials = req.body
  userService.save(credentials).then((user) => {
    if (user) {
      const loginToken = userService.getLoginToken(user)
      res.cookie('loginToken', loginToken)
      res.send(user)
    } else {
      res.status(400).send('Cannot signup')
    }
  })
})

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('loginToken')
  res.send('logged-out!')
})

app.get('/**', (req, res) => {
  res.sendFile(path.resolve('public/index.html'))
})
