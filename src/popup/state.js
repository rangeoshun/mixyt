import r from 'redda/src'

export const state = r.state()

export const active_tab = () => null
export const set_tab = (_, tab) => tab
export const set_tab_active = (tab, is_active) => {
  const active_tab = { ...tab, is_active }

  chrome.runtime.sendMessage(ext_id, { action: "set_active", active_tab })

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
