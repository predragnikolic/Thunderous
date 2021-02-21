import { createContainerComponent } from '../../src/index.js'

export default createContainerComponent(() => {

  return /* html */`
    <page-container>
      <presentational-link><router-link href="/">Go Back</router-link></presentational-link>
      <p>Thunderous was mainly inspired by React, with some ideas taken from Vue and Angular.  The idea is to make a library that offers a complete solution using native web components to build applications.</p>
      <p>This means you don't have to worry about being locked in, and you can even import any native web component seamlessly from anywhere!  This opens up thousands of libraries and open source components, including but not limited to Google's popular Polymer.</p>
      <p>Putting aside the class "extends" syntax, defining components <i>functionally</i> with Thunderous allows us to reduce unneccessary repetition, track component state, easily assign events to the DOM, and more, all while avoiding some of the issues with inheritance.</p>
    </page-container>
  `
})
