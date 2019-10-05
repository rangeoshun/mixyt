import r from "redda/src"

import { app } from "./views"

import {
  state,
  set_monitor,
  set_monitor_src,
  set_master,
  set_master_src,
  set_player,
  set_player_prop,
  set_devices
} from "./state"

const runtime = chrome.runtime
const storage = chrome.storage
const body = document.body
const head = document.head

const clear_frame = () => (
  (body.innerHTML = '<div id="app-cont" />'), (head.innerHTML = "")
)

const handle_message = message => {
  if (message.action == "off") return window.location.reload()
}

const is_src_mutation = mutations =>
  !!mutations.find(m => m.attributeName == "src")

const init_state = label => {
  const name = `player_${label}`
  const deck_doc = document.querySelector(`.deck-${label}`).contentDocument
  const player = deck_doc.querySelector("video")

  state.disp(set_monitor, {
    [`out_${label}`]: document.querySelector(`.monitor-${label}`)
  })

  state.disp(set_master, {
    [`out_${label}`]: document.querySelector(`.master-${label}`)
  })

  state.disp(set_player, { [name]: player })

  const observer = new MutationObserver(mutations => {
    if (!is_src_mutation(mutations)) return

    state.disp(set_monitor_src, {
      [`src_${label}`]: player.captureStream()
    })

    state.disp(set_master_src, {
      [`src_${label}`]: player.captureStream()
    })
  })

  observer.observe(player, { attributes: true })

  state.disp(set_player_prop, {
    name: name,
    volume: 0,
    muted: false,
    src: player.src,
    crossorigin: true
  })
}

const materialize = cb => {
  const link = document.createElement("link")
  link.rel = "stylesheet"
  link.href =
    "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css"
  body.appendChild(link)
}

const init = () => {
  console.clear()
  clear_frame()
  materialize()

  const app_cont = document.getElementById("app-cont")
  const render_app = r.render(app_cont, [app])

  runtime.onMessage.addListener(handle_message)

  state.on_change(() => {
    console.log(state.get())
  })

  document.querySelector(".deck-a").contentWindow.onload = () => init_state("a")
  document.querySelector(".deck-b").contentWindow.onload = () => init_state("b")

  navigator.mediaDevices.enumerateDevices().then(devs =>
    chrome.storage.local.set({
      devices: devs
        .filter(({ kind }) => kind == "audiooutput")
        .map(({ deviceId, label }) => ({ id: deviceId, label }))
    })
  )
}

init()
