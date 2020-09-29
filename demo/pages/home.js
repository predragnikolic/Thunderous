import { createContainerComponent } from '../../src/index.js'

export default createContainerComponent(({useComponentState, createHandler}) => {
  
  const [name, setName] = useComponentState('name', 'World')

  createHandler('handleClick', () => {
    if (name === 'Jon') setName('World')
    else setName('Jon')
  })

  return /*html*/`
    <container-component>
      <div>Hello ${name}</div>
      <button onclick="handleClick()">toggle name</button>
      <div>
        <router-link href="/page">demo page link</router-link>
      </div>
    </container-component>
  `
})
