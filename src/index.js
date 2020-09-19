import {
  createHandler,
  runWithCleanup,
  useComponentState,
  updateRoute,
  renderComponent,
} from './componentUtils.js'

const defaultConfig = {
  Element: HTMLElement,
  useShadowDOM: true,
  shadowMode: 'open',
  passUtilities: true,
}

export const createWebComponent = ((window, _config, _getHTML) => {

  // make first argument optional
  const config = typeof _config === 'object' ? _config : {}
  const getHTML = typeof _config === 'function' ? _config : _getHTML

  // merge provided config with defaults
  const assignedConfig = Object.assign({}, defaultConfig, config)
  const { Element, useShadowDOM, shadowMode, passUtilities } = assignedConfig

  // return the component class for the user to define it
  return class Component extends Element {

    constructor() {
      super()
      const component = this

      // set up handlers object on the global scope
      window.handlers = window.handlers || {}
      const generateUniqueKey = () => {
        const uniqueKey = Math.random().toString(36).slice(2)
        if (window.handlers[uniqueKey]) return generateUniqueKey()
        window.handlers[uniqueKey] = {}
        return uniqueKey
      }

      component.key = generateUniqueKey()
      component.root = useShadowDOM
        ? component.attachShadow({mode: shadowMode})
        : component

      if (passUtilities) component.utilities = {
        createHandler: createHandler.bind(null, window, component.key),
        runWithCleanup: runWithCleanup.bind(null, new Map()),
        updateRoute: updateRoute.bind(null, window),
        useComponentState: useComponentState.bind(
          null, component, getHTML, renderComponent, new Map()),
        head: window.document.head,
      }
    }

    connectedCallback() {
      const component = this
      renderComponent(component, getHTML)
    }

  }
}).bind(null, globalThis)

const presentationalConfig = {
  useShadowDOM: true,
  passUtilities: false,
}

export const createPresentationalComponent = (_config, _getHTML) => {

  // make first argument optional
  const config = typeof _config === 'object' ? _config : {}
  const getHTML = typeof _config === 'function' ? _config : _getHTML

  // merge provided config with defaults
  // and prioritize presentational configurations.
  const assignedConfig = Object.assign({}, defaultConfig, config, presentationalConfig)

  return createWebComponent(assignedConfig, getHTML)
}

const containerConfig = {
  useShadowDOM: false,
}

export const createContainerComponent = (_config, _getHTML) => {

  // make first argument optional
  const config = typeof _config === 'object' ? _config : {}
  const getHTML = typeof _config === 'function' ? _config : _getHTML

  // merge provided config with defaults
  // and prioritize container configurations.
  const assignedConfig = Object.assign({}, defaultConfig, config, containerConfig)

  return createWebComponent(assignedConfig, getHTML)
}

export const createRouter = ((window, config) => {

  return createContainerComponent(({useComponentState, runWithCleanup}) => {

    const { document, location } = window
    const [route, setRoute] = useComponentState('route', location.pathname)
    const { title, component } = config[route]

    document.title = title

    runWithCleanup('router', () => {
      const updateRoute = () => {
        document.title = title
        setRoute(location.pathname)
      }
      window.addEventListener('popstate', updateRoute)
      window.addEventListener('pushstate', updateRoute)
      return () => {
        window.removeEventListener('popstate', updateRoute)
        window.removeEventListener('pushstate', updateRoute)
      }
    })

    return `<${component}></${component}>`
  })

}).bind(null, globalThis)
