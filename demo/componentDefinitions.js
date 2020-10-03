import RouterPage from './components/routerPage.js'
import { PageContainer, ToDos } from './components/container/index.js'
import { PresentationalPage, PresentationalLink, PresentationalTitle, ToDoForm, ToDo } from './components/presentational/index.js'
import HomePage from './pages/home.js'
import AboutPage from './pages/about.js'
import { RouterLink } from '../src/index.js'

customElements.define('router-page', RouterPage)
customElements.define('router-link', RouterLink)
customElements.define('presentational-link', PresentationalLink)
customElements.define('presentational-title', PresentationalTitle)
customElements.define('page-container', PageContainer)
customElements.define('to-dos', ToDos)
customElements.define('to-do-form', ToDoForm)
customElements.define('to-do', ToDo)
customElements.define('presentational-page', PresentationalPage)
customElements.define('page-home', HomePage)
customElements.define('page-about', AboutPage)
