export default /* css */`

:host {
  background-color: #000;
  box-sizing: border-box;
  color: #fff;
  display: grid;
  grid-template-rows: auto 1fr auto;
  font-family: sans-serif;
  font-size: 20px;
  height: 100%;
}

.header,
.footer {
  background-color: #222;
  display: inline-block;
}

.header {
  font-size: 30px;
}

.footer {
  font-size: 15px;
}

.header,
.footer,
.content {
  padding: 30px;
}

`
