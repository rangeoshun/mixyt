import r from "redda/src"

const { div, iframe } = r.dom

const body = document.body
const head = document.head

const clear_frame = () => (
  (body.innerHTML = '<div id="app-cont" />'), (head.innerHTML = "")
)

const deck = name => () => [
  iframe,
  {
    class: `deck ${name}`,
    frameBorder: "none",
    src: window.location.href.replace(/desktop/, "m") + "&mixyt_role=" + name
  }
]

const mixer = [div, { id: "mixer" }]

const app = () => [
  div,
  { id: "app" },
  [deck("deck-a")],
  [mixer],
  [deck("deck-b")]
]

const reload_desktop = () =>
  (location.href =
    location.href
      .replace(/m\./, "www.")
      .replace("&app=m", "")
      .replace("persist_app=1", "") + "&app=desktop&persist_app=1")

const handle_message = message => {
  if (message.action == "off") return reload_desktop()
}

const init = () => {
  if (!location.href.match(/m\.youtube/)) return reload_mobile()

  console.clear()
  clear_frame()

  const app_cont = document.getElementById("app-cont")
  const render_app = r.render(app_cont, [app])

  chrome.runtime.onMessage.addListener(handle_message)
}

init()
