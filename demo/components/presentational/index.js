import { createPresentationalComponent } from '../../../src/index.js'
import presentationalPage from './page/page.js'
import presentationalLink from './link/link.js'

export const PresentationalPage = createPresentationalComponent(presentationalPage)
export const PresentationalLink = createPresentationalComponent(presentationalLink)