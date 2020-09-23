import { createContainerComponent } from '../../src/index.js'

export default createContainerComponent(() => {

  return /*html*/`
    <h1>demo page</h1>
    <router-link href="/">Go Back</router-link>
  `
})
