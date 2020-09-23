import { createRouterPage } from '../../src/index.js'

export default createRouterPage({
  '/': {
    title: 'My Site',
    component: 'page-home',
  },
  '/page': {
    title: 'My Site | Demo Page',
    component: 'page-demo',
  },
})
