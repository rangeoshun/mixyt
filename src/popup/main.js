import r from "redda/src"
import { app } from "./views"
import { state, set_tab, set_on } from "./state"

window.s = state
const runtime = chrome.runtime

const store_tab = tab =>
  tab && (state.disp(set_tab, tab), state.disp(set_on, !!tab.is_active))

const init = () => {
  const app_cont = document.getElementById("app-cont")
  const render_app = r.render(app_cont, [app])
  state.on_change(render_app)

  runtime.onMessage.addListener((message, sender) => {
    if (sender.id != chrome.runtime.id) return

    if (message.action == "set_active") store_tab(message.active_tab)
  })

  runtime.sendMessage(runtime.id, { action: "get_active" })
}

init()
