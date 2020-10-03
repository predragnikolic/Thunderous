import style from './toDo.style.js' 

export default () => /*html*/`
  <style>${style}</style>
  <span><slot></slot></span>
`
