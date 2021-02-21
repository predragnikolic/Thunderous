export default () => {

  return /* html */`
    <presentational-page>
      <header slot="header">
        <presentational-title>
          <h1>THUNDEROUS (Demo)</h1>
        </presentational-title>
      </header>
      <slot></slot>
      <footer slot="footer">Thunderous is a library for building a responsive application driven by native web components.</footer>
    </presentational-page>
  `

}
