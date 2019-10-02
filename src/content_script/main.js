import r from "redda/src"

import { app } from "./views"
import { state, master, set_master_src } from "./state"

const body = document.body
const head = document.head

const clear_frame = () => (
  (body.innerHTML = '<div id="app-cont" />'), (head.innerHTML = "")
)

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
