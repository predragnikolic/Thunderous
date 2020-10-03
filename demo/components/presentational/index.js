import { createPresentationalComponent } from '../../../src/index.js'
import presentationalPage from './page/page.js'
import presentationalLink from './link/link.js'
import presentationalTitle from './title/title.js'
import toDoForm from './toDoForm/toDoForm.js'

export const PresentationalPage = createPresentationalComponent(presentationalPage)
export const PresentationalLink = createPresentationalComponent(presentationalLink)
export const PresentationalTitle = createPresentationalComponent(presentationalTitle)
export const ToDoForm = createPresentationalComponent(toDoForm)