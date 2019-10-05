import r from "redda/src"
import { app } from "./views"
import {
  state,
  set_tab,
  set_on,
  set_devices,
  set_monitor,
  set_master
} from "./state"

window.s = state
const runtime = chrome.runtime
const storage = chrome.storage

const store_tab = tab =>
  tab && (state.disp(set_tab, tab), state.disp(set_on, !!tab.is_active))

const handle_devices = (devices = []) => state.disp(set_devices, devices)

const init = () => {
  const app_cont = document.getElementById("app-cont")
  const render_app = r.render(app_cont, [app])
  M.FormSelect.init(document.querySelectorAll("select"))

  state.on_change(() => {
    render_app()
    setTimeout(() => {
      M.FormSelect.init(document.querySelectorAll("select"))
    })
  })

  runtime.onMessage.addListener((message, sender) => {
    if (sender.id != chrome.runtime.id) return

    if (message.action == "set_active") store_tab(message.active_tab)
  })

  runtime.sendMessage(runtime.id, { action: "get_active" })
  storage.local.get(
    ["devices", "monitor_device", "master_device"],
    ({ devices, monitor_device, master_device }) => {
      if (devices) handle_devices(devices)
      if (monitor_device) state.disp(set_monitor, monitor_device)
      if (master_device) state.disp(set_master, master_device)
    }
  )
  storage.onChanged.addListener(
    changes =>
      changes && changes.devices && handle_devices(changes.devices.newValue)
  )
}

window.onload = init
