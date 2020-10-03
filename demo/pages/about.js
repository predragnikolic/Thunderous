import { createContainerComponent } from '../../src/index.js'

export default createContainerComponent(() => {

  return /*html*/`
    <page-container>
      <presentational-link><router-link href="/">Go Back</router-link></presentational-link>
      
    </page-container>
  `
})
