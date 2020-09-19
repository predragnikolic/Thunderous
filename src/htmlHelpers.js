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

// store onevent functions in one isolated place on the global scope
export const parseHandlers = (componentKey, htmlStr) =>
  htmlStr.replace(/ on(.+)\="(.+)"/g, ` on$1="handlers['${componentKey}'].$2"`)
