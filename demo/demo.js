import RouterPage from './components/routerPage.js'
import { Container } from './components/container/index.js'
import { Presentational } from './components/presentational/index.js'
import Home from './pages/home.js'
import DemoPage from './pages/page.js'
import { RouterLink } from '../src/index.js'

customElements.define('router-page', RouterPage)
customElements.define('router-link', RouterLink)
customElements.define('container-component', Container)
customElements.define('presentational-component', Presentational)
customElements.define('page-home', Home)
customElements.define('page-demo', DemoPage)
