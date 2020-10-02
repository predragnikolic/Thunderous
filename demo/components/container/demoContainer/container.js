export default ({createHandler, useComponentState, repeat}) => {

  const [toDoList, setToDoList] = useComponentState('test', [])

  createHandler('removeLink', idx => {
    toDoList.splice(idx, 1)
    setToDoList(toDoList)
  })

  createHandler('addToDo', event => {
    event.preventDefault()
    const { value } = event.target.querySelector('#ToDoInput')
    toDoList.push(value)
    setToDoList(toDoList)
  })

  return /*html*/`
    <presentational-component>
      <header slot="header">my header text</header>
      <slot></slot>
      <h2>To-Dos:</h2>
      <form onsubmit="addToDo(event)">
        <input id="ToDoInput"/> <button>Add item</button>
      </form>
      ${repeat(toDoList, (toDoItem, idx) => /*html*/`
        <div>
          <span>${toDoItem}</span>
          <button onclick="removeLink(${idx})">&times;</button>
        </div>
      `)}
      <footer slot="footer">my footer text</footer>
    </presentational-component>
  `
}
