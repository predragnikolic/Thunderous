export default ({createHandler, useComponentState, repeat, component}) => {

  const [toDoList, setToDoList] = useComponentState('test', [])

  createHandler('removeLink', idx => {
    toDoList.splice(idx, 1)
    setToDoList(toDoList)
  })

  createHandler('addToDo', event => {
    event.preventDefault()
    const { value } = component.refs.toDoInput
    toDoList.push(value)
    setToDoList(toDoList)
  })

  return /*html*/`
    <h2>To-Dos:</h2>
    <form onsubmit="addToDo(event)">
      <to-do-form>
        <input data-ref="toDoInput" id="ToDoInput"/> <button>Add item</button>
      </to-do-form>
    </form>
    ${repeat(toDoList, (toDoItem, idx) => /*html*/`
      <to-do>
        <button onclick="removeLink(${idx})">&times;</button>
        ${toDoItem}
      </to-do>
    `)}
  `
}