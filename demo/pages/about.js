import { createContainerComponent } from '../../src/index.js'

export default createContainerComponent(() => {

  return /*html*/`
    <page-container>
      <presentational-link href="/">Go Back</presentational-link>
      <h1>demo page</h1>
    </page-container>
  `
})
