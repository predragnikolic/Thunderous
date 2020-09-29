import { createContainerComponent } from '../../src/index.js'

export default createContainerComponent(() => {

  return /*html*/`
    <container-component>
      <h1>demo page</h1>
      <router-link href="/">Go Back</router-link>
    </container-component>
  `
})
