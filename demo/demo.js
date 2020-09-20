import Router from './components/router.js'
import { Container } from './components/container/index.js'
import { Presentational } from './components/presentational/index.js'
import Home from './pages/home.js'
import DemoPage from './pages/page.js'

customElements.define('current-page', Router)
customElements.define('container-component', Container)
customElements.define('presentational-component', Presentational)
customElements.define('page-home', Home)
customElements.define('page-demo', DemoPage)
