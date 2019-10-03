import r from "redda/src"

import {
  state,
  tab_exists,
  upsert_tab,
  rm_tab,
  active_tab,
  set_active
} from "./state"

window.s = state

const runtime = chrome.runtime
const tabs = chrome.tabs

const is_youtube_url = url => !!(url && url.match(/youtube\.com\/watch/))

const convert_tab = tab => ({
  id: tab.id,
  window_id: tab.windowId,
  is_youtube:
    tab.is_youtube == undefined ? is_youtube_url(tab.url) : tab.is_youtube,
  is_active: !!tab.is_active,
  injected: tab.injected || false
})

const store_tab = tab => state.disp(upsert_tab, tab)

const get_active_tab = () => {
  const curr = state.get()

  return curr.tab_list.find(({ id }) => id == curr.active_tab)
}

const send_active_tab = () => {
  const tab = get_active_tab()

  runtime.sendMessage(runtime.id, {
    action: "set_active",
    active_tab: tab
  })
}

const inject_script = active_tab => {
  if (active_tab.injected) return

  tabs.executeScript(active_tab.id, {
    file: "content_script.js"
  })
  tabs.insertCSS(active_tab.id, {
    file: "content_script.css"
  })

  state.disp(upsert_tab, { ...active_tab, injected: true })
}

const handle_message = (message, sender) => {
  if (sender.id != runtime.id) return

  if (message.action == "set_active") {
    const active_tab = message.active_tab

    store_tab(active_tab)

    if (active_tab.is_active) {
      tabs.executeScript(active_tab.id, {
        code: `location.href = location.href.replace(/www/, "m").replace("&app=desktop", "") + "&app=m"`
      })
      chrome.webRequest.onBeforeSendHeaders.addListener(
        force_user_agent,
        { urls: ["https://*/*"] },
        ["blocking", "requestHeaders"]
      )
    } else {
      tabs.sendMessage(active_tab.id, { action: "off" })
      state.disp(upsert_tab, { ...active_tab, injected: false })
      chrome.webRequest.onBeforeSendHeaders.removeListener(force_user_agent)
    }

    return
  }

  if (message.action == "get_active") return send_active_tab()
}

const convert_native_tab = tab_ => ({
  ...convert_tab(tab_),
  ...(tab_exists(tab_) || {})
})

const set_active_tab = tab => state.disp(set_active, tab.id)

const handle_tab_switch = ({ tabId } = {}) => {
  if (!tabId) return

  tabs.get(tabId, tab_ => {
    const tab = convert_native_tab(tab_)

    store_tab(tab)
    set_active_tab(tab)

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

const force_user_agent = details => {
  const tab = get_active_tab()

  if (!details || !tab.is_active) return {}

  return {
    requestHeaders: details.requestHeaders.map(header => {
      if (header.name.toLowerCase() != "user-agent") return header

      return {
        name: "User-Agent",
        value:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1"
      }
    })
  }
}

const init_active_tab = ([tab_]) => {
  const tab = convert_native_tab(tab_)
  store_tab(tab)
  set_active_tab(tab)
}

const handle_remove = id => state.disp(rm_tab, { id })

const init = () => {
  state.on_change(send_active_tab)
  tabs.query({ active: true }, init_active_tab)
  tabs.onActivated.addListener(handle_tab_switch)
  tabs.onUpdated.addListener(handle_update)
  tabs.onRemoved.addListener(handle_remove)
  runtime.onMessage.addListener(handle_message)
}

init()
