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
 * 
 * @returns {string} - the final parsed HTML (onclick="handleClick()" becomes onclick="handlers['xxxxxx'].handleClick()")
 */
export const parseHandlers = (componentKey, htmlStr) =>
  htmlStr.replace(/ on(.+)\="(.+)"/g, ` on$1="handlers['${componentKey}'].$2"`)

/**
 * Since slots are not supported in the light DOM, we are parsing them out of an html string,
 * and replacing them with the initial HTML provided between the component tags.  Also, this
 * logic includes named slots, all of which will be completely removed and replaced with their
 * corresponding slotted elements.
 * 
 * @param {*} htmlStr - the HTML string provided within the component as a template (<p><slot></slot></p>)
 * @param {*} initialHTML - the HTML provided between the component tags (<my-component>this content</my-component>)
 * 
 * @returns {string} - the final parsed HTML (<p><slot></slot></p> becomes <p><my-component>this content</my-component></p>)
 */
export const parseSlots = (htmlStr, initialHTML) => {
  // NOTE: this function may not be the most efficient, with all
  // the iteration going on.  But it works, and it's readable.
  // Might want to revisit it for efficiency's sake, though.

  // Regex is inherently non-human-readable, so let's at least
  // hide them all in nice readable variables
  const namedSlotsRegex = /<slot .*name="[^"]+"[^>]*>.*<\/\s*slot>/g
  const namedSlottedRegex = /<(\S+) .*slot="[^"]*"[^>]*>(\s|.)*<\/\s*\1>/g
  const nameAttrRegex = /.*name="([^"]+)".*/g
  const slotAttrRegex = /.*slot="([^"]+)".*/g
  const anonSlotRegex = /<slot.*\/\s*slot>/
  const globalAnonSlotRegex = /<slot.*\/\s*slot>/g

  // get all named slots, then map each one to an object which
  // contains both the html string and the `name` attribute value.
  const allNamedSlots = initialHTML.match(namedSlotsRegex)
    .map(slotTagStr => ({
    	slotTagStr,
      name: slotTagStr.replace(nameAttrRegex, '$1')
    }))

  // get all slotted elements, then map each one to an object which
  // contains both the html string and the `slot` attribute value.
  const allNamedSlotted = htmlStr.match(namedSlottedRegex)
    .map(slottedTagStr => ({
      slottedTagStr,
      slot: slottedTagStr.replace(slotAttrRegex, '$1')
    }))

  // use a reducer to replace parts of the html one slot at a time
  const htmlOutput = allNamedSlotted.reduce((output, {slottedTagStr, slot}) => {
    const {slotTagStr} = allNamedSlots.find(s => s.name === slot)
    return output = output.replace(slotTagStr, slottedTagStr)
  }, initialHTML)

  // finally, after all other slots are replaced, we can replace the
  // anonymous slot with the unassigned content.  Then, Since only one
  // anonymous slot is allowed, (even in the shadow DOM,) we just
  // strip out all others.
  const anonContent = htmlStr.replace(namedSlottedRegex, '')
  return htmlOutput
    .replace(anonSlotRegex, anonContent)
    .replace(globalAnonSlotRegex, '')
}
