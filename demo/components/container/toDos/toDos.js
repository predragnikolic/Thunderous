export default ({ createHandler, useComponentState, repeat, component }) => {

  const [toDoList, setToDoList] = useComponentState('toDoList', [])
  const [toDoInput, setToDoInput] = useComponentState('toDoInput', '')
  const [disabled, setDisabled] = useComponentState('disabled', true)

  createHandler('removeLink', idx => {
    toDoList.splice(idx, 1)
    setToDoList(toDoList)
  })

  createHandler('updateToDoInput', () => {
    const { value } = component.refs.toDoInput
    setDisabled(!value)
    setToDoInput(value)
  })

  createHandler('addToDo', event => {
    event.preventDefault()
    const { value } = component.refs.toDoInput
    toDoList.push(value)
    setToDoList(toDoList)
  })

  return /* html */`
    <h2>To-Dos:</h2>
    <form onsubmit="addToDo(event)">
      <to-do-form>
        <input data-ref="toDoInput" id="ToDoInput" oninput="updateToDoInput()" value="${toDoInput}"/>
        <button ${disabled ? 'disabled' : ''}>Add item</button>
      </to-do-form>
    </form>
    ${repeat(toDoList, (toDoItem, idx) => /* html */`
      <to-do>
        <button onclick="removeLink(${idx})" id="ToDoRemove-${idx}">&times;</button>
        ${toDoItem}
      </to-do>
    `)}
  `
}
