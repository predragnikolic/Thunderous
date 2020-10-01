export default ({runWithCleanup, useComponentState}) => {

  const [test, setTest] = useComponentState('test', false)

  runWithCleanup('keydown', () => {
    const sayHi = () => setTest(!test)
    window.addEventListener('keydown', sayHi)
    return () => window.removeEventListener('keydown', sayHi)
  })

  return /*html*/`
    <presentational-component>
      <header slot="header">my header text: ${test}</header>
      <slot></slot>
      <footer slot="footer">my footer text</footer>
    </presentational-component>
  `
}
