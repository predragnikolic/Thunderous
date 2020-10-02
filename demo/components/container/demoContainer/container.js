export default () => {

  return /*html*/`
    <presentational-component>
      <header slot="header">THUNDEROUS (demo app)</header>
      <slot></slot>
      <footer slot="footer">Thunderous is a library for building a responsive application using native web components.</footer>
    </presentational-component>
  `

}
