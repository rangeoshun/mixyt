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

const init_state = () => {
  const player_a = get_player(".deck-a")
  const player_b = get_player(".deck-b")

  player_a.setAttribute("crossOrigin", true)
  player_a.src = player_a.src
  player_b.setAttribute("crossOrigin", true)
  player_b.src = player_b.src

  state.disp(set_master, {
    out_a: document.querySelector(".master-a"),
    out_b: document.querySelector(".master-b")
  })

  state.disp(set_player, { player_a, player_b })

  state.disp(set_player_prop, {
    name: "player_a",
    volume: 0,
    muted: false
  })

  state.disp(set_player_prop, {
    name: "player_b",
    volume: 0,
    muted: false
  })

  state.disp(set_master_src, {
    src_a: player_a.captureStream(),
    src_b: player_b.captureStream()
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
    init_state()
  }
}

init()
