export default /* css */`

::slotted(*),
::slotted(*:visited) {
  color: #aaf;
  text-decoration: none;
  transition: color .5s;
}

::slotted(*:hover),
::slotted(*:active) {
  color: #faa;
  text-decoration: underline;
}

`
