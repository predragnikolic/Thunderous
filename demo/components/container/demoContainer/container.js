export default ({createHandler, useComponentState, repeat, component}) => {

  const [list, setList] = useComponentState('test', [])

  createHandler('removeLink', (event, idx) => {
    event.preventDefault()
    list.splice(idx, 1)
    setList(list)
  })

  createHandler('addToDo', (event) => {
    event.preventDefault()
    const { value } = event.target.querySelector('#ToDoInput')
    list.push(value)
    setList(list)
  })

  return /*html*/`
    <presentational-component>
      <header slot="header">my header text</header>
      <slot></slot>
      <h2>To-Dos:</h2>
      <form onsubmit="addToDo(event)">
        <input id="ToDoInput"/> <button>Add item</button>
      </form>
      ${repeat(list, (toDoItem, idx) => /*html*/`
        <div>
          <span>${toDoItem}</span>
          <button onclick="removeLink(event, ${idx})">&times;</button>
        </div>
      `)}
      <footer slot="footer">my footer text</footer>
    </presentational-component>
  `
}
