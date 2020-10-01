export default ({runWithCleanup, useComponentState, repeat}) => {

  const [list, setList] = useComponentState('test', [])

  runWithCleanup('keydown', () => {
    const sayHi = () => {
      list.push('link')
      setList(list)
    }
    window.addEventListener('keydown', sayHi)
    return () => window.removeEventListener('keydown', sayHi)
  })

  return /*html*/`
    <presentational-component>
      <header slot="header">
        ${repeat(list, link => /*html*/`<a href="#">${link}</a>`)}
      </header>
      <slot></slot>
      <footer slot="footer">my footer text</footer>
    </presentational-component>
  `
}
