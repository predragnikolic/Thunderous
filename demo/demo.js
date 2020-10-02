import RouterPage from './components/routerPage.js'
import { Container } from './components/container/index.js'
import { Presentational } from './components/presentational/index.js'
import HomePage from './pages/home.js'
import AboutPage from './pages/about.js'
import { RouterLink } from '../src/index.js'

customElements.define('router-page', RouterPage)
customElements.define('router-link', RouterLink)
customElements.define('container-component', Container)
customElements.define('presentational-component', Presentational)
customElements.define('page-home', HomePage)
customElements.define('page-about', AboutPage)
