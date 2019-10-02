import r from "redda/src"

const { div, iframe } = r.dom

const deck = name => () => [
  iframe,
  {
    class: `deck ${name}`,
    frameBorder: "none",
    src: window.location.href.replace(/desktop/, "m") + "&mixyt_role=" + name
  }
]

const mixer = [div, { id: "mixer" }]

export const app = () => [
  div,
  { id: "app" },
  [deck("deck-a")],
  [mixer],
  [deck("deck-b")]
]
