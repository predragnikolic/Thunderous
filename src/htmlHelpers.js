// this is the most efficient way to parse HTML, much faster than innerHTML
export const parseHTML = htmlStr => {
  const range = document.createRange()
  range.selectNode(document.body) // required in Safari
  return range.createContextualFragment(htmlStr)
}

// this is the most efficient way to clear HTML, much faster than innerHTML
export const clearHTML = element => {
  let i = element.childNodes.length
  while(i--) { element.removeChild(element.lastChild) }
}

// All `onevent` functions are stored by component key in an isolated place
// on the global scope.  (See createHandler in componentUtils.js.)
// This function adds the appropriate context to these handlers in a given html string.
export const parseHandlers = (componentKey, htmlStr) =>
  htmlStr.replace(/ on(.+)\="(.+)"/g, ` on$1="handlers['${componentKey}'].$2"`)
