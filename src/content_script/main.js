import r from "redda/src"

import { app } from "./views"
import {
  state,
  set_master,
  set_master_src,
  set_player,
  set_player_prop
} from "./state"

const runtime = chrome.runtime
const body = document.body
const head = document.head

const clear_frame = () => (
  (body.innerHTML = '<div id="app-cont" />'), (head.innerHTML = "")
)

const reload_desktop = () =>
  (location.href =
    location.href
      .replace(/m\./, "www.")
      .replace("&app=m", "")
      .replace("persist_app=1", "") + "&app=desktop&persist_app=1")

const handle_message = message => {
  if (message.action == "off") return reload_desktop()
}

const get_player = name =>
  document.querySelector(name).contentDocument.querySelector("video")

const init_state = label => {
  const name = `player_${label}`
  const player = get_player(`.deck-${label}`)

  state.disp(set_master, {
    [`out_${label}`]: document.querySelector(`.master-${label}`)
  })

  state.disp(set_player, { [name]: player })

  state.disp(set_player_prop, {
    name: name,
    volume: 0,
    muted: false,
    src: player.src,
    crossorigin: true
  })

  state.disp(set_master_src, {
    [`src_${label}`]: player.captureStream()
  })
}

const init = () => {
  if (!location.href.match(/m\.youtube/)) return reload_mobile()

  console.clear()
  clear_frame()

  const app_cont = document.getElementById("app-cont")
  const render_app = r.render(app_cont, [app])

  runtime.onMessage.addListener(handle_message)

  state.on_change(() => console.log(state.get()))

  window.onload = () => {
    init_state("a")
    init_state("b")
  }
}

init()
