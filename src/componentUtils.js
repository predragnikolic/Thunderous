import { parseHandlers, clearHTML } from './htmlHelpers.js'

export const createHandler = (global, componentKey, handlerKey, callback) => {
  global.handlers[componentKey][handlerKey] = callback
}

export const useComponentState = (component, getHTML, renderComponent, state, key, value) => {
  const updateValue = value => {
    state.set(key, value)
    renderComponent(component, getHTML)
  }
  if (typeof state.get(key) === 'undefined') updateValue(value)
  return [state.get(key), updateValue]
}

export const runWithCleanup = (effects, key, callback) => {
  const defaultCleanup = () => {}
  const cleanup = effects.get(key) || defaultCleanup
  cleanup()
  const newCleanup = callback()
  effects.set(key, newCleanup)
}

export const updateRoute = (window, route) => {
  const { history, dispatchEvent } = window
  history.pushState({}, route, route)
  const pushStateEvent = new CustomEvent('pushstate')
  dispatchEvent(pushStateEvent)
}

export const renderComponent = ((document, parseHandlers, clearHTML, component, getHTML) => {
  const { root, utilities, key } = component
  const templateElement = document.createElement('template')
  const rawHtml = getHTML(utilities)
  const html = parseHandlers(key, rawHtml)
  templateElement.innerHTML = html
  const instance = templateElement.content.cloneNode(true)
  clearHTML(root)
  root.appendChild(instance)
}).bind(null, globalThis.document, parseHandlers, clearHTML)
