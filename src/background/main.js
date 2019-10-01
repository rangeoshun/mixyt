import r from "redda/src"

const state = r.state()

const tab_exists = tab => state.get().tab_list.find(({ id }) => id == tab.id)

const tab_list = () => []
const upsert_tab = (tab_list, tab) => {
  const existing = tab_exists(tab)

  if (existing) return tab_list.map(ex => (ex.id == tab.id ? tab : ex))

  return [...tab_list, tab]
}

const rm_tab = (tab_list, tab) => tab_list.filter(({ id }) => tab.id != id)

state.add(tab_list, upsert_tab, rm_tab)

const active_tab = () => null
const set_active = (_, tab_id) => tab_id

state.add(active_tab, set_active)

const is_youtube_url = url => !!(url && url.match(/youtube/))

const convert_tab = ({ id, windowId, url, is_youtube, is_active } = {}) => ({
  id,
  window_id: windowId,
  is_youtube: is_youtube == undefined ? is_youtube_url(url) : is_youtube,
  is_active: !!is_active
})

const store_tab = tab => {
  state.disp(upsert_tab, tab)
  state.disp(set_active, tab.id)
}

const send_active_tab = () => {
  const curr = state.get()
  const tab = curr.tab_list.find(({ id }) => id == curr.active_tab)

  chrome.runtime.sendMessage(ext_id, {
    action: "set_active",
    active_tab: curr.tab_list.find(({ id }) => tab.id == id)
  })
}

const ext_id = chrome.runtime.id

window.s = state

const init = () => {
  state.on_change(send_active_tab)

  chrome.tabs.query({ active: true }, ([tab]) => store_tab(tab))

  chrome.tabs.onActivated.addListener(({ tabId } = {}) => {
    if (!tabId) return

    chrome.tabs.get(tabId, tab_ => {
      const tab = convert_tab({
        ...tab_,
        ...(tab_exists(tab_) || {})
      })

      store_tab(tab)
      if (!tab.is_youtube) chrome.pageAction.hide(tab.id)
      else chrome.pageAction.show(tab.id)
    })
  })

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message)
    if (sender.id != chrome.runtime.id) return
    if (message.action == "set_active") return store_tab(message.active_tab)
    if (message.action == "get_active") return send_active_tab()
  })
}

init()
