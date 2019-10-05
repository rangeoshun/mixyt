import r from "redda/src"

const runtime = chrome.runtime

export const state = r.state()

export const active_tab = () => null
export const set_tab = (_, tab) => tab
export const set_tab_active = (tab, is_active) => {
  const active_tab = { ...tab, is_active }

  runtime.sendMessage(runtime.id, {
    action: "set_active",
    active_tab
  })

  return active_tab
}

state.add(active_tab, set_tab, set_tab_active)

export const is_on = () => false
export const set_on = (_, val) => val
export const toggle = prev => {
  const is_active = !prev

  state.disp(set_tab_active, is_active)

  return is_active
}

state.add(is_on, set_on, toggle)

export const devices = () => ({ list: [], monitor: null, master: null })
export const set_devices = (devices, list) => ({ ...devices, list })

state.add(devices, set_devices, set_monitor, set_master)
