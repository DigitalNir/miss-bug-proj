import { storageService } from './async-storage.service.js'
import { utilService } from './util.service.js'

const STORAGE_KEY = 'bugDB'
const BASE_URL = '/api/bug/'

// _createBugs()

export const bugService = {
  query,
  getById: get,
  save,
  remove,
  getDefaultBugFilter,
  getEmptyBug,
}

function query(filterBy) {
  return axios.get(BASE_URL, { params: filterBy }).then((res) => res.data)
}

function get(bugId) {
  return axios.get(BASE_URL + bugId).then((res) => res.data)
}

function remove(bugId) {
  return axios.delete(BASE_URL + bugId).then((res) => res.data)
}

function save(bug) {
  if (bug._id) {
    return axios.put(BASE_URL, bug).then((res) => res.data)
  } else {
    return axios.post(BASE_URL, bug).then((res) => res.data)
  }
}

function getEmptyBug(title = '', description = '', severity = 0) {
  return {
    _id: '',
    title,
    description,
    severity,
    createdAt: Date.now(),
    creator: {
      _id,
      fullname,
    },
    labels: [],
  }
}

function getDefaultBugFilter() {
  return {
    title: '',
    severity: '',
    labels: [],
  }
}

function _createBugs() {
  let bugs = utilService.loadFromStorage(STORAGE_KEY)
  if (!bugs || !bugs.length) {
    bugs = [
      {
        title: 'Infinite Loop Detected',
        severity: 4,
        _id: '1NF1N1T3',
      },
      {
        title: 'Keyboard Not Found',
        severity: 3,
        _id: 'K3YB0RD',
      },
      {
        title: '404 Coffee Not Found',
        severity: 2,
        _id: 'C0FF33',
      },
      {
        title: 'Unexpected Response',
        severity: 1,
        _id: 'G0053',
      },
    ]
    utilService.saveToStorage(STORAGE_KEY, bugs)
  }
}
