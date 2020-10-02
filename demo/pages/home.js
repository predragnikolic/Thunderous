import { createContainerComponent } from '../../src/index.js'

export default createContainerComponent(() => {
  return /*html*/`
    <page-container>
      <presentational-link href="/about">Read more about this</presentational-link>
      <to-dos></to-dos>
    </page-container>
  `
})
