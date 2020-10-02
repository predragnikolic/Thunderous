import { createContainerComponent } from '../../../src/index.js'
import pageContainer from './page/page.js'
import toDos from './toDos/toDos.js'

export const PageContainer = createContainerComponent(pageContainer)
export const ToDos = createContainerComponent(toDos)
