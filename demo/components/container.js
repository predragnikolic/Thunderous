import { createContainerComponent } from '../../src/index.js'

export default createContainerComponent(({createHandler, runWithCleanup, useComponentState, updateRoute}) => {

  const [name, setName] = useComponentState('name', 'World')

  createHandler('handleClick', () => {
    if (name === 'Jon') setName('World')
    else setName('Jon')
  })

  createHandler('useRouter', event => {
    event.preventDefault()
    updateRoute(event.currentTarget.href)
  })

  runWithCleanup('keydown', () => {
    const sayHi = () => alert('hello dude')
    window.addEventListener('keydown', sayHi)
    return () => window.removeEventListener('keydown', sayHi)
  })

  return /*html*/`
    <presentational-component>
      <header slot="header">my header text</header>
      <div>Hello ${name}</div>
      <button onclick="handleClick()">toggle name</button>
      <div>
        <a href="/page" onclick="useRouter(event)">Demo Page Link</a>
      </div>
      <footer slot="footer">my footer text</footer>
    </presentational-component>
  `
})
