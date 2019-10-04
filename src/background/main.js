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
const webRequest = chrome.webRequest
const contentSettings = chrome.contentSettings

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
      webRequest.onHeadersReceived.addListener(
        force_video_cors,
        { urls: ["https://*.googlevideo.com/*"], tabId: active_tab.id },
        ["blocking", "responseHeaders", "extraHeaders"]
      )

      inject_script(active_tab)
    } else {
      tabs.sendMessage(active_tab.id, { action: "off" })
      state.disp(upsert_tab, { ...active_tab, injected: false })
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
}

const CORS_HEADER_NAME = "Access-Control-Allow-Origin"
const force_video_cors = details => {
  return {
    responseHeaders: details.responseHeaders.map(header => {
      if (header.name != CORS_HEADER_NAME) return header

      return {
        name: CORS_HEADER_NAME,
        value: "*"
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
  contentSettings.microphone.set({
    primaryPattern: "https://www.youtube.com/*",
    setting: "allow"
  })
}

init()
