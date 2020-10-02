import { parseHandlers, clearHTML, getFragment } from './htmlHelpers.js'

/**
 * This function creates a handler on the global scope, which corresponds to a
 * component by way of a dynamically created and unique alphanumeric key.
 * This is done to address the issue of context on inline event handlers,
 * without overcomplicating it.  Doing it this way accomplishes two things:
 * 1. It avoids the extra dependency on an external rendering library.
 *    No sense when we have such limited need for a single feature.
 * 2. It gets us as close as we can get to native syntax, hopefully avoiding
 *    the issue of lock-in.  The main inspiration behind this library is
 *    to honor native syntax as much as possible, after all.
 * 
 * @param {object} global - (implicit)
 * @param {string} componentKey - (implicit)
 * @param {string} handlerKey - the name of the handler function which can be referenced in the template
 * @param {function} handler - the function definition of the event handler
 */
export const createHandler = (global, componentKey, handlerKey, handler) => {
  global.components[componentKey].handlers[handlerKey] = handler
}

/**
 * This function was inspired by React's useState() function. Using a simple Map,
 * this tracks dynamic values within a component function.  The initial value
 * will not be set more than once, although this function is expected to rerun
 * on every render cycle.  The setter returned by this function also triggers a
 * rerender, so this will run again to get the latest value.
 * 
 * @param {object} component - (implicit)
 * @param {function} getHTML - (implicit)
 * @param {function} renderComponent - (implicit)
 * @param {Map} state - (implicit)
 * @param {any} key - the key used to create a unique space in a map so it can be referenced again in the next pass
 * @param {any} value - the initial value to set before it's updated
 * 
 * @typedef ComponentState
 * @type {array}
 * @property {any} 0 - the current value of this state entry
 * @property {any} 1 - the setter which updates the value and then rerenders the component
 * 
 * @returns {ComponentState}
 */
export const useComponentState = (component, getHTML, renderComponent, key, value) => {
  const {state} = component
  const updateValue = value => {
    state.set(key, value)
    renderComponent(component, getHTML)
  }
  if (typeof state.get(key) === 'undefined') updateValue(value)
  return [state.get(key), updateValue]
}

/** 
 * This function is inspired by React's useEffect(), but I tried to name it
 * to appeal to intuition, since it took me a while to grasp what useEffect
 * was supposed to be.  As the name suggests, this function runs a callback
 * which should return another callback for cleanup.  Good for subscribing
 * and unsubscribing, for example.
 * 
 * @callback callback
 * @returns {function} - the cleanup function, meant for things like unsubscribing, etc
 * 
 * @param {Map} effects - (implicit) 
 * @param {any} key - the key used to create a unique space in a map so it can be referenced again in the next pass
 * @param {callback} callback - the logic to run before cleaning up
 */
export const runWithCleanup = (effects, key, callback) => {
  const defaultCleanup = () => {}
  const cleanup = effects.get(key) || defaultCleanup
  cleanup()
  const newCleanup = callback()
  effects.set(key, newCleanup)
}

/**
 * This function just updates the history state and fires a custom event,
 * since no 'pushstate' event exists natively.  This allows any number of
 * router components to subscribe to this event and react accordingly.
 * 
 * @param {object} window - (implicit)
 * @param {string} path - the relative URL path where we want to navigate.
 */
export const updateRoute = (window, path) => {
  const { history, dispatchEvent } = window
  history.pushState({}, path, path)
  const pushStateEvent = new CustomEvent('pushstate')
  dispatchEvent(pushStateEvent)
}

/**
 * This is just a simple render function.
 * 
 * @param {object} document - (implicit)
 * @param {function} parseHandlers - (implicit)
 * @param {function} clearHTML - (implicit)
 * @param {function} getFragment - (implicit)
 * @param {object} component - the component instance which we want to render
 * @param {function} getHTML - the component function which should return some HTML to render
 */
export const renderComponent = ((document, parseHandlers, clearHTML, getFragment, component, getHTML) => {
  const { root, utilities, useSlots, initialHTML } = component
  const { id } = component.dataset

  // process HTML with functions passed in
  const rawHtml = getHTML(utilities)
  const htmlWithHandlers = parseHandlers(id, rawHtml)
  const fragment = getFragment(useSlots, htmlWithHandlers, initialHTML)

  // clone a template element for use of slot elements
  const templateElement = document.createElement('template')
  templateElement.content.appendChild(fragment)
  const instance = templateElement.content.cloneNode(true)

  // remember component IDs from previous render...
  const previousChildComponentNodes = [...component.querySelectorAll('[data-id]')]
  const previousChildComponentTags = previousChildComponentNodes.reduce((acc, cur) => {
    if (!acc[cur.tagName]) acc[cur.tagName] = []
    acc[cur.tagName].push(cur)
    return acc
  }, {})

  // ...and carry over to next render.
  for (const tag in previousChildComponentTags) {
    const correspondingNodes = [...instance.querySelectorAll(tag)]
    correspondingNodes.forEach((node, idx) =>
      node.dataset.id = previousChildComponentTags[tag][idx].dataset.id)
  }

  // clear the previously rendered HTML
  clearHTML(root)

  // replace it with newly rendered HTML
  root.appendChild(instance)

}).bind(null, globalThis.document, parseHandlers, clearHTML, getFragment)

/**
 * This is a quick utility to use for loops within templates.
 * 
 * @param {Array} arr - the array to iterate over
 * @param {function} callback - the callback to run on each item - should return an HTML string
 * 
 * @returns {string} - the full combined HTML string from each of the iterations
 */
export const repeat = (arr, callback) => arr.map(callback).join('')
