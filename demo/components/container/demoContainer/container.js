export default ({runWithCleanup}) => {

  runWithCleanup('keydown', () => {
    const sayHi = () => alert('hello dude')
    window.addEventListener('keydown', sayHi)
    return () => window.removeEventListener('keydown', sayHi)
  })

  return /*html*/`
    <presentational-component>
      <header slot="header">my header text</header>
      <slot></slot>
      <footer slot="footer">my footer text</footer>
    </presentational-component>
  `
}
