import r from "redda/src"
import { app } from "./views"
import { state, set_tab, set_on } from "./state"

window.s = state

const store_tab = tab =>
  tab && (state.disp(set_tab, tab), state.disp(set_on, !!tab.is_active))

const ext_id = chrome.runtime.id

const init = () => {
  const app_cont = document.getElementById("app-cont")
  const render_app = r.render(app_cont, [app])

  state.on_change(render_app)

  chrome.runtime.onMessage.addListener((message, sender) => {
    if (sender.id != chrome.runtime.id) return

    if (message.action == "set_active") store_tab(message.active_tab)
  })

  chrome.runtime.sendMessage(ext_id, { action: "get_active" })
}

init()
