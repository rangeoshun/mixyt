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

const is_youtube_url = url => !!(url && url.match(/youtube\.com\/watch/))

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

const get_active_tab = () => {
  const curr = state.get()

  return curr.tab_list.find(({ id }) => id == curr.active_tab)
}

const send_active_tab = () => {
  const tab = get_active_tab()

  chrome.runtime.sendMessage(ext_id, {
    action: "set_active",
    active_tab: tab
  })
}

const ext_id = chrome.runtime.id

const inject_script = active_tab => {
  chrome.tabs.executeScript(active_tab.id, {
    file: "content_script.js"
  })
  chrome.tabs.insertCSS(active_tab.id, {
    file: "content_script.css"
  })
}

const handle_message = (message, sender) => {
  if (sender.id != chrome.runtime.id) return

  if (message.action == "set_active") {
    const active_tab = message.active_tab

    store_tab(active_tab)

    if (active_tab.is_active) inject_script(active_tab)
    else chrome.tabs.sendMessage(active_tab.id, { action: "off" })

    return
  }

  if (message.action == "get_active") return send_active_tab()
}

const convert_native_tab = tab_ =>
  convert_tab({
    ...tab_,
    ...(tab_exists(tab_) || {})
  })

const handle_tab_switch = ({ tabId } = {}) => {
  if (!tabId) return

  chrome.tabs.get(tabId, tab_ => {
    const tab = convert_native_tab(tab_)

    store_tab(tab)

    if (!tab.is_youtube) chrome.browserAction.disable(tab.id)
    else chrome.browserAction.enable(tab.id)
  })
}

const handle_update = (id, change, tab_) => {
  const tab = convert_native_tab(tab_)
  const active_tab = get_active_tab()

  store_tab(tab)

  if (active_tab.id != id || !active_tab.is_youtube) return

  if (change.status == "loading" && active_tab.is_active)
    return inject_script(active_tab)
}

const init = () => {
  state.on_change(send_active_tab)
  chrome.tabs.query({ active: true }, ([tab]) => store_tab(tab))
  chrome.tabs.onActivated.addListener(handle_tab_switch)
  chrome.tabs.onUpdated.addListener(handle_update)
  chrome.runtime.onMessage.addListener(handle_message)
}

init()
