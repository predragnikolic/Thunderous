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
  htmlStr.replace(/ on([^\=]+)\="([^"]+)"/g, ` on$1="components['${componentKey}'].handlers.$2"`)

/**
 * Since slots are not supported in the light DOM, we are parsing them out of an html string,
 * and replacing them with the initial HTML provided between the component tags.
 * 
 * @param {function} parseHTML - (implicit)
 * @param {boolean} useSlots - if false, the given htmlStr will be converted to a fragment and instantly returned without further processing
 * @param {string} htmlStr - the HTML string provided within the component as a template (<p><slot></slot></p>)
 * @param {string} initialHTML - the HTML provided between the component tags (<my-component>this content</my-component>)
 * 
 * @returns {DocumentFragment} - the final parsed HTML (<p><slot></slot></p> becomes <p><my-component>this content</my-component></p>)
 */
export const getFragment = ((parseHTML, useSlots, htmlStr, initialHTML) => {

  // the fragment created by the inner template
  const htmlFragment = parseHTML(htmlStr)

  // If we're not using slots, we can just return the bare fragment immediately
  if (!useSlots) return htmlFragment
  
  // if no slots were found then still no sense processing excessively
  const slotEls = htmlFragment.querySelectorAll('slot')
	if (!slotEls.length) return htmlFragment
  
  // if there are slots but no provided html, just remove them and return
  if (!initialHTML || initialHTML.trim() === '') {
  	for (const slotEl of slotEls) {
    	slotEl.remove()
    }
    return htmlFragment
  }

  // if we've made it this far, then we need to start swapping slots for content.
  // create a fragment to represent the html provided between the component tags.
  const initialHtmlFragment = parseHTML(initialHTML)
  const namedSlottedEls = initialHtmlFragment.querySelectorAll('[slot]')

	// insert every slotted element in the template before its corresponding slot
	for (const namedSlottedEl of namedSlottedEls) {
  	namedSlottedEl.remove() // strip all named slots from initial html fragment
  	const correspondingSlotEl = Array.from(slotEls).find(
    	slotEl => slotEl.getAttribute('name') === namedSlottedEl.getAttribute('slot'))
    if (correspondingSlotEl) {
      correspondingSlotEl.parentNode.insertBefore(namedSlottedEl, correspondingSlotEl)
      correspondingSlotEl.remove()
    }
  }
  
  // whatever content is left over gets appended to the generic slot
  const genericSlot = htmlFragment.querySelector('slot:not([name])')
  if (genericSlot)
  	genericSlot.parentNode.insertBefore(initialHtmlFragment, genericSlot)
  
  // remove all slots after we're finished with them
  for (const slotEl of slotEls) {
  	slotEl.remove()
  }

  // return the parsed fragment after all replacements have been made
  return htmlFragment
}).bind(null, parseHTML)
