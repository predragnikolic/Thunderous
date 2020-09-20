/**
 * This is the most efficient way to parse HTML, much faster than innerHTML.
 * 
 * @param {string} htmlStr - a string containing only raw HTML
 */
export const parseHTML = htmlStr => {
  const range = document.createRange()
  range.selectNode(document.body) // required in Safari
  return range.createContextualFragment(htmlStr)
}

/**
 * This is the most efficient way to clear HTML, much faster than innerHTML.
 * 
 * @param {HTMLElement} element - the DOM element we want to empty
 */
export const clearHTML = element => {
  let i = element.childNodes.length
  while(i--) { element.removeChild(element.lastChild) }
}

/**
 * All `onevent` functions are stored by component key in an isolated place
 * on the global scope.  (See createHandler in componentUtils.js.)
 * This function adds the appropriate context to these handlers in a given html string.
 * 
 * @param {string} componentKey - a unique alphanumeric key linked to a particular component
 * @param {string} htmlStr - a string containing only raw HTML
 */
export const parseHandlers = (componentKey, htmlStr) =>
  htmlStr.replace(/ on(.+)\="(.+)"/g, ` on$1="handlers['${componentKey}'].$2"`)
