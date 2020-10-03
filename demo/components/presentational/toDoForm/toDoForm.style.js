export default /*css*/`

::slotted(input) {
  background-color: #ccf;
  border: 0 solid;
  border-radius: 4px;
  padding: 10px;
  transition: background-color .5s;
}

::slotted(input:focus) {
  outline: 0;
  background-color: #fff;
}

::slotted(button) {
  background-color: #66c;
  border: 0 solid;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  padding: 10px 20px;
  transition: background-color .5s;
}

::slotted(button:hover) {
  background-color: #c66;
}

`

