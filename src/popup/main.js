import r from "redda/src"
const { h1 } = r.dom

const title = [h1, "MixYT"]
const app = [title]
const node = document.getElementById("app-cont")

r.render(node, app)
