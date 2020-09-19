import { createPresentationalComponent } from '../../src/index.js'
import style from './presentational.style.js'

export default createPresentationalComponent(() => {
  return /*html*/`
    <style>${style}</style>

    <slot name="header" class="header"></slot>
    <div class="content">
      <slot></slot>
    </div>
    <slot name="footer" class="footer"></slot>
  `
})
