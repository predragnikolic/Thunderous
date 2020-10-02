import { createRouterPage } from '../../src/index.js'

export default createRouterPage({
  '/': {
    title: 'Thunderous',
    component: 'page-home',
  },
  '/about': {
    title: 'Thunderous | About',
    component: 'page-about',
  },
})
