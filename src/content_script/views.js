import r from "redda/src"

const { div, audio, iframe } = r.dom

const deck = name => () => [
  iframe,
  {
    class: `deck ${name}`,
    frameBorder: "none",
    src: window.location.href.replace(/desktop/, "m") + "&mixyt_role=" + name
  }
]

const master = name => () => [audio, { class: name }]

const mixer = [div, { id: "mixer" }]

export const app = () => [
  div,
  { id: "app" },
  [deck("deck-a")],
  [mixer],
  [deck("deck-b")],
  [master("master-a")],
  [master("master-b")]
]
