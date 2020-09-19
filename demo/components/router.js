import { createRouter } from '../../src/index.js'

export default createRouter({
  '/': {
    title: 'My Site',
    component: 'page-home',
  },
  '/page': {
    title: 'My Site | Demo Page',
    component: 'page-demo',
  },
})
