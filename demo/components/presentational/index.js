import { createPresentationalComponent } from '../../../src/index.js'
import presentationalPage from './page/page.js'
import presentationalLink from './link/link.js'
import presentationalTitle from './title/title.js'
import toDoForm from './toDoForm/toDoForm.js'
import toDo from './toDo/toDo.js'

export const PresentationalPage = createPresentationalComponent(presentationalPage)
export const PresentationalLink = createPresentationalComponent(presentationalLink)
export const PresentationalTitle = createPresentationalComponent(presentationalTitle)
export const ToDoForm = createPresentationalComponent(toDoForm)
export const ToDo = createPresentationalComponent(toDo)