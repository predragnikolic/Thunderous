export default ({runWithCleanup, createHandler, useComponentState, repeat}) => {

  const [list, setList] = useComponentState('test', [])

  createHandler('removeLink', (event, idx) => {
    event.preventDefault()
    list.splice(idx, 1)
    setList(list)
  })

  runWithCleanup('keydown', () => {
    const sayHi = () => {
      list.push('remove')
      setList(list)
    }
    window.addEventListener('keydown', sayHi)
    return () => window.removeEventListener('keydown', sayHi)
  })

  return /*html*/`
    <presentational-component>
      <header slot="header">
        ${repeat(list, (link, idx) => /*html*/`
          <a href="#" onclick="removeLink(event, ${idx})">${link} ${idx}</a>
        `)}
      </header>
      <slot></slot>
      <footer slot="footer">my footer text</footer>
    </presentational-component>
  `
}
