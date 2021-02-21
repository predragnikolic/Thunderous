export default /* css */`

:host {
  display: block;
  padding-bottom: 10px;
}

::slotted(button) {
  --size: 20px;
  background-color: #66c;
  border: 0 solid;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  height: var(--size);
  margin-right: calc(var(--size) / 2);
  width: var(--size);
  line-height: var(--size);
  text-align: center;
  vertical-align: top;
  transition: background-color .5s;
}

::slotted(button:hover) {
  background-color: #c66;
}

`
