import Router from './components/router.js'
import { Container } from './components/container/containerExports.js'
import { Presentational } from './components/presentational/presentationalExports.js'
import Home from './pages/home.js'
import DemoPage from './pages/page.js'

customElements.define('current-page', Router)
customElements.define('container-component', Container)
customElements.define('presentational-component', Presentational)
customElements.define('page-home', Home)
customElements.define('page-demo', DemoPage)
