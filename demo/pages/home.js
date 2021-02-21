import { createContainerComponent } from '../../src/index.js'

export default createContainerComponent(() => {
  return /* html */`
    <page-container>
      <presentational-link>
        <router-link href="/about">Read more about this</router-link>
      </presentational-link>
      <to-dos></to-dos>
    </page-container>
  `
})
