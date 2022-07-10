import r from "redda/src"

const runtime = chrome.runtime

export const state = r.state()

export const active_tab = () => null
export const set_tab = (_, tab) => tab
export const set_tab_active = (tab, is_active) => {
  const active_tab = { ...tab, is_active }

  runtime.sendMessage(runtime.id, {
    action: "set_active",
    active_tab,
  })

  return active_tab
}

state.add(active_tab, set_tab, set_tab_active)

export const is_on = () => false
export const turn_on = (prev_active, is_active) => {
  if (prev_active != is_active) state.disp(set_tab_active, is_active)

  return is_active
}

state.add(is_on, turn_on)

export const devices = () => ({
  list: [],
  monitor: "default",
  master: "default",
})
export const set_devices = (devices, list) => ({ ...devices, list })
const set_device = (role) => (devices, device) => ({
  ...devices,
  [role]: devices.list.find(({ id }) => id == device) ? device : "default",
})
export const set_monitor = set_device("monitor")
export const set_master = set_device("master")

state.add(devices, set_devices, set_monitor, set_master)
