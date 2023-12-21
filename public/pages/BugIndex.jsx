const { Link, useSearchParams } = ReactRouterDOM
const { useState, useEffect, useRef } = React

import { bugService } from '../services/bug.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { BugList } from '../cmps/BugList.jsx'
import { BugFilter } from '../cmps/BugFilter.jsx'
import { utilService } from '../services/util.service.js'

export function BugIndex() {
  const [bugs, setBugs] = useState(null)
  const [filterBy, setFilterBy] = useState(bugService.getDefaultBugFilter())
  const debounceOnSetFilter = useRef(utilService.debounce(onSetFilter, 500))

  useEffect(() => {
    loadBugs()
  }, [filterBy])

  function loadBugs() {
    bugService
      .query(filterBy)
      .then((bugs) => setBugs(bugs))
      .catch((err) => console.log('err:', err))
  }

  function onRemoveBug(bugId) {
    bugService
      .remove(bugId)
      .then(() => {
        console.log('Deleted Succesfully!')
        setBugs((prevBugs) => {
          return prevBugs.filter((bug) => bug._id !== bugId)
        })
        showSuccessMsg(`Bug removed ${bugId}`)
      })
      .catch((err) => {
        console.log('Error from onRemoveBug ->', err)
        showErrorMsg('Cannot remove bug')
      })
  }

  function onSetFilter(filterBy) {
    setFilterBy((prevFilter) => ({
      ...prevFilter,
      ...filterBy,
      pageIdx: isUndefined(prevFilter.pageIdx) ? undefined : 0,
    }))
  }

  function onChangePageIdx(diff) {
    if (isUndefined(filterBy.pageIdx)) return
    setFilterBy((prevFilter) => {
      let newPageIdx = prevFilter.pageIdx + diff
      if (newPageIdx < 0) newPageIdx = 0
      return { ...prevFilter, pageIdx: newPageIdx }
    })
  }

  function onTogglePagination() {
    setFilterBy((prevFilter) => {
      return {
        ...prevFilter,
        pageIdx: isUndefined(prevFilter.pageIdx) ? 0 : undefined,
      }
    })
  }

  function isUndefined(value) {
    return value === undefined
  }

  function onAddBug() {
    const bug = {
      title: prompt('Bug title?'),
      description: prompt('Bug Description?'),
      severity: +prompt('Bug severity?'),
    }
    bugService
      .save(bug)
      .then((savedBug) => {
        console.log('Added Bug', savedBug)
        setBugs([...bugs, savedBug])
        showSuccessMsg('Bug added')
      })
      .catch((err) => {
        console.log('Error from onAddBug ->', err)
        showErrorMsg('Cannot add bug')
      })
  }

  if (!bugs) return <div>Loading...</div>
  const { title, severity, labels, pageIdx } = filterBy

  return (
    <section className="bug-index main-layout full">
      <h3>Bugs App</h3>
      <section className="pagination">
        <button onClick={() => onChangePageIdx(1)}>+</button>
        {pageIdx + 1 || 'No Pagination'}
        <button onClick={() => onChangePageIdx(-1)}>-</button>
        <button onClick={onTogglePagination}>Toggle pagination</button>
      </section>
      <BugFilter
        filterBy={{ title, severity, labels }}
        onSetFilter={debounceOnSetFilter.current}
      />
      <Link to="/bug/edit">Add Bug</Link>
      <BugList bugs={bugs} onRemoveBug={onRemoveBug} />
    </section>
  )
}
