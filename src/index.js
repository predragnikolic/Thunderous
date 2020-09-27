import {
  createHandler,
  runWithCleanup,
  useComponentState,
  updateRoute,
  renderComponent,
} from './componentUtils.js'

const defaultConfig = {
  Element: HTMLElement,
  useSlots: true,
  useShadowDOM: true,
  shadowMode: 'open',
  passUtilities: true,
}

/**
 * This function returns a native web component class, taking inspiration
 * from React's functional component approach.  The utilities, however,
 * are injected in the props of the component function, so the developer
 * won't need to import anything and the function remains pure.
 * 
 * @param {object} window - (implicit)
 * @param {object} defaultConfig - (implicit)
 * @param {object|function} _config - since custom configuration is optional, this parameter may also be used for the getHTML function
 * @param {function} _getHTML - this is the main component function, which should return an html string.
 * 
 * @returns {class} - the extended class of HTMLElement (or whatever else was specified in the config)
 */
export const createWebComponent = ((window, defaultConfig, _config, _getHTML) => {

  // make config argument optional
  const config = typeof _config === 'object' ? _config : {}
  const getHTML = typeof _config === 'function' ? _config : _getHTML

  // merge provided config with defaults
  const assignedConfig = Object.assign({}, defaultConfig, config)
  const { Element, useShadowDOM, shadowMode, passUtilities, useSlots } = assignedConfig

  // set up handlers object on the global scope
  window.handlers = window.handlers || {}

  // return the component class for the developer to define it with customElements.define()
  return class Component extends Element {

    constructor() {
      super()
      const component = this

      // assign a unique key to this component so it can be tracked in a parallel scope.
      // This is mainly done to address the issue of context on event handlers.
      const generateUniqueKey = () => {
        const uniqueKey = Math.random().toString(36).slice(2)
        if (window.handlers[uniqueKey]) return generateUniqueKey()
        window.handlers[uniqueKey] = {}
        return uniqueKey
      }
      component.key = generateUniqueKey()

      // the "root" of the component can either be the shadowRoot or
      // the so-called lightRoot, depending on the config options.
      component.root = useShadowDOM
        ? component.attachShadow({mode: shadowMode})
        : component

      // the useSlots configuration option determines whether we should be
      // able to use <slot> in the light DOM.  This option is ignored when
      // useShadowDOM is set to true, because <slot> is natively available.
      component.useSlots = !useShadowDOM && useSlots

      // store the innerHTML before rendering the template
      component.initialHTML = component.innerHTML

      // track all cleanup functions on the component, so we can run on disconnected
      component.cleanupMap = new Map()

      // define the utilities on the instance, because we want these bindings to
      // happen only once, and it's easier to destructure later rather than
      // passing around an extra argument.
      if (passUtilities) component.utilities = {
        createHandler: createHandler.bind(null, window, component.key),
        runWithCleanup: runWithCleanup.bind(null, component.cleanupMap),
        updateRoute: updateRoute.bind(null, window),
        useComponentState: useComponentState.bind(
          null, component, getHTML, renderComponent, new Map()),
        head: window.document.head,
        component,
      }
    }

    // we just want to render when it loads, nothing fancy.
    connectedCallback() {
      const component = this
      renderComponent(component, getHTML)
    }

    // run all the cleanup functions on disconnect
    disconnectedCallback() {
      const component = this
      for (const cleanup of component.cleanupMap.values()) {
        cleanup()
      }
    }

  }
}).bind(null, globalThis, defaultConfig)

/**
 * This function takes inspiration from the container vs presentational pattern
 * often seen in React projects.  The idea is that presentational components
 * should be concerned with style alone, not data or meaningful semantics.
 * Therefore, this component does not provide utilities to the function, but
 * it does make use of the shadow DOM, which allows <slot> and <style>. Since
 * presentation is not intended for SEO impact, this type of component will
 * not concern itself with SSR.
 * 
 * @param {object} defaultConfig - (implicit)
 * @param {object|function} _config - since custom configuration is optional, this parameter may also be used for the getHTML function
 * @param {function} _getHTML - this is the main component function, which should return an html string.
 * 
 * @returns {class} - the extended class of HTMLElement (or whatever else was specified in the config)
 */
export const createPresentationalComponent = ((defaultConfig, _config, _getHTML) => {

  // make config argument optional
  const config = typeof _config === 'object' ? _config : {}
  const getHTML = typeof _config === 'function' ? _config : _getHTML

  // merge provided config with defaults
  // and prioritize presentational configurations.
  const assignedConfig = Object.assign({}, defaultConfig, config, {
    useShadowDOM: true,
    passUtilities: false,
  })

  return createWebComponent(assignedConfig, getHTML)
}).bind(null, defaultConfig)

/**
 * This function takes inspiration from the container vs presentational pattern
 * often seen in React projects.  The idea is that container components
 * should be concerned with data and meaningful semantics, not style.
 * Therefore, this component provides helpful utilities to the function, and
 * does not use the shadow DOM.  This means its markup will be rendered with SSR
 * and it does not support style.  The only non-native option available to this
 * type of component is slotted templates for the light DOM, for the sake of
 * template composition.
 * 
 * @param {object} defaultConfig - (implicit)
 * @param {object|function} _config - since custom configuration is optional, this parameter may also be used for the getHTML function
 * @param {function} _getHTML - this is the main component function, which should return an html string.
 * 
 * @returns {class} - the extended class of HTMLElement (or whatever else was specified in the config)
 */
export const createContainerComponent = ((defaultConfig, _config, _getHTML) => {

  // make config argument optional
  const config = typeof _config === 'object' ? _config : {}
  const getHTML = typeof _config === 'function' ? _config : _getHTML

  // merge provided config with defaults
  // and prioritize container configurations.
  const assignedConfig = Object.assign({}, defaultConfig, config, {
    useSlots: true,
    useShadowDOM: false,
  })

  return createWebComponent(assignedConfig, getHTML)
}).bind(null, defaultConfig)

/**
 * This takes heavier inspiration from Vue/Angular.  This is
 * used to create a router component that renders content based
 * on the URL, then listens for client-side changes.
 * 
 * @param {object} window - (implicit)
 * @param {object} config - the router configuration, using relative URLs as object keys
 * @param {string} config[route].title - the title of the page, corresponding with the document title
 * @param {string} config[route].component - the component tag to render when the page matches the given route
 * 
 * @returns {class} - the RouterPage class which extends HTMLElement
 */
export const createRouterPage = ((window, config) => {

  return createContainerComponent(({useComponentState, runWithCleanup}) => {

    // destructure what we need from window for purity's sake
    const { document, location } = window

    // Initialize the route with the current URL path.  This setter will trigger
    // this component function to run again, so it will rerender when we need it.
    const [route, setRoute] = useComponentState('route', location.pathname)
    const { title, component } = config[route]

    // update the title in the browser tab
    document.title = title

    runWithCleanup('router', () => {

      // subscribe to client-side routing events to rerender the contents of the router component
      const updateRoute = () => setRoute(location.pathname)
      window.addEventListener('popstate', updateRoute)
      window.addEventListener('pushstate', updateRoute)

      // unsubscribe from all events upon cleanup
      return () => {
        window.removeEventListener('popstate', updateRoute)
        window.removeEventListener('pushstate', updateRoute)
      }
    })

    return `<${component}></${component}>`
  })

}).bind(null, globalThis)

/**
 * This is a common type of component essential for any client-side rendered templating engines.
 * This component simply renders a link that uses a built-in handler to prevent its default behavior
 * in favor of using the router instead.  This is just a component class that the developer may
 * import and use with customElements.define()
 */
export const RouterLink = createContainerComponent(({updateRoute, createHandler, component}) => {

  const href = component.getAttribute('href')

  createHandler('useRouter', event => {
    event.preventDefault()
    updateRoute(href)
  })

  return /*html*/`
    <a href="${href}" onclick="useRouter(event)">
      <slot></slot>
    </a>
  `
})
