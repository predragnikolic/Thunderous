import style from './link.style.js' 

export default ({component}) => /*html*/`
  <style>${style}</style>
  <router-link href="${component.getAttribute('href')}" class="link">
    <slot></slot>
  </router-link>
`
