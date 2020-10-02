import { createContainerComponent } from '../../src/index.js'

export default createContainerComponent(() => {

  return /*html*/`
    <container-component>
      <router-link href="/">Go Back</router-link>
      <h1>demo page</h1>
    </container-component>
  `
})
