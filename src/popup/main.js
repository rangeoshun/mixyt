import r from "redda/src"
const { nav, div, a, input, label, ul, li, span } = r.dom

const switcher = [
  div,
  { class: "switch center-align" },
  [
    label,
    "Off",
    [input, { type: "checkbox" }],
    [span, { class: "lever" }],
    "On"
  ]
]

const title_bar = [
  nav,
  [div, { class: "nav-wrapper" }, [a, { class: "brand-logo" }, "MixYT"]]
]
const app = [title_bar, [div, { class: "section" }, switcher]]
const node = document.getElementById("app-cont")

r.render(node, app)
