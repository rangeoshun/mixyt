import r from "redda/src"

export const state = r.state()

export const tab_exists = (tab) =>
  state.get().tab_list.find(({ id }) => id == tab.id)

export const tab_list = () => []
export const upsert_tab = (tab_list, tab) => {
  const existing = tab_exists(tab)

  if (existing) return tab_list.map((ex) => (ex.id == tab.id ? tab : ex))

  return [...tab_list, tab]
}

export const rm_tab = (tab_list, tab) =>
  tab_list.filter(({ id }) => tab.id != id)

state.add(tab_list, upsert_tab, rm_tab)

export const active_tab = () => null
export const set_active = (_, tab_id) => tab_id

state.add(active_tab, set_active)
