import fs from 'fs'
import { utilService } from './util.service.js'

const PAGE_SIZE = 3
export const bugService = {
  query,
  getById,
  remove,
  save,
}

const bugs = utilService.readJsonFile('data/bug.json')
function query(filterBy) {
  let bugsToReturn = bugs

  if (filterBy.title) {
    const regExp = new RegExp(filterBy.title, 'i')
    bugsToReturn = bugsToReturn.filter((bug) => regExp.test(bug.title))
  }
  if (filterBy.severity) {
    bugsToReturn = bugsToReturn.filter(
      (bug) => bug.severity >= filterBy.severity
    )
  }

  if (filterBy.pageIdx !== undefined) {
    const startIdx = filterBy.pageIdx * PAGE_SIZE
    bugsToReturn = bugsToReturn.slice(startIdx, startIdx + PAGE_SIZE)
  }

  if (filterBy.labels && filterBy.labels.length) {
    bugsToReturn = bugsToReturn.filter((bug) =>
      filterBy.labels.some((label) => bug.labels.includes(label))
    )
  }

  return Promise.resolve(bugsToReturn)
}

function getById(bugId) {
  const bug = bugs.find((bug) => bug._id === bugId)
  if (!bug) return Promise.reject('Bug doesnt exist!')

  return Promise.resolve(bug)
}

function remove(bugId, loggedinUser) {
  const bugIdx = bugs.findIndex((bug) => bug._id === bugId)
  if (bugIdx === -1) return Promise.reject('No Such Bug')
  const bug = bugs[bugIdx]
  if (!loggedinUser.isAdmin && bug.creator._id !== loggedinUser._id)
    return Promise.reject('Not your bug')

  bugs.splice(bugIdx, 1)
  return _saveBugsToFile()
}

function save(bug, loggedinUser) {
  if (bug._id) {
    const existingBug = bugs.find((currBug) => currBug._id === bug._id)
    if (!existingBug) {
      return Promise.reject('Bug not found')
    }
    if (!loggedinUser.isAdmin && existingBug.creator._id !== loggedinUser._id) {
      return Promise.reject('Not your bug')
    }
    Object.assign(existingBug, bug)
  } else {
    bug._id = utilService.makeId()
    bug.creator = loggedinUser
    bugs.unshift(bug)
  }
  return _saveBugsToFile().then(() => bug)
}

function _saveBugsToFile() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(bugs, null, 2)
    fs.writeFile('data/bug.json', data, (err) => {
      if (err) {
        console.log(err)
        return reject(err)
      }
      resolve()
    })
  })
}
