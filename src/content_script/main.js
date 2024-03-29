import r from "redda/src"

import { app } from "./views"

import {
  state,
  set_monitor,
  set_monitor_src,
  set_master,
  set_master_src,
  set_master_device,
  set_player,
  set_player_prop,
  set_monitor_device,
} from "./state"

import { filter_chains, get_source, cross_gains } from "./audio"

const runtime = chrome.runtime
const storage = chrome.storage
const body = document.body
const head = document.head

const clear_frame = () => (
  (body.innerHTML = '<div id="app-cont" />'), (head.innerHTML = "")
)

const update_devices = () =>
  navigator.mediaDevices.enumerateDevices().then((devs) =>
    storage.local.set({
      devices: devs
        .filter(({ kind }) => kind == "audiooutput")
        .map(({ deviceId, label }) => ({ id: deviceId, label })),
    })
  )

const handle_message = (message) => {
  if (message.action == "off") return window.location.reload()
  if (message.action == "update_devices") return update_devices()
}

const is_src_mutation = (mutations) =>
  !!mutations.find((m) => m.attributeName == "src")

const init_state = (label) => {
  const name = `player_${label}`
  const out_name = `out_${label}`
  const src_name = `src_${label}`
  const deck_doc = document.querySelector(`.deck-${label}`).contentDocument
  const getPlayer = () => deck_doc.querySelector("video")
  let player = getPlayer()

  state.disp(set_monitor, {
    [out_name]: document.querySelector(`audio.monitor-${label}`),
  })

  state.disp(set_master, {
    [out_name]: document.querySelector(`audio.master-${label}`),
  })

  state.disp(set_player, { [name]: player })

  const handle_canplay = () => {
    player = getPlayer()
    const source = get_source(out_name, player.captureStream())

    state.disp(set_player, { [name]: player })

    state.disp(set_monitor_src, {
      [src_name]: source,
    })

    state.disp(set_master_src, {
      [src_name]: source,
    })

    player.pause()
    player.controls = true
    player.volume = 0.00001
    player.crossOrigin = true
  }

  // TODO: Clean up this part
  const observer = new MutationObserver((changes) => {
    const playerChange = changes.every(
      (c) => c.removedNodes[0]?.id !== "player"
    )

    if (!playerChange) return

    handle_canplay()
  })
  observer.observe(deck_doc.body, { childList: true })

  player.addEventListener("canplay", handle_canplay)
}

const set_devices = ({ monitor_device, master_device } = {}) => {
  if (monitor_device) state.disp(set_monitor_device, monitor_device)
  if (master_device) state.disp(set_master_device, master_device)
}

const DECKS = ["deck_a", "deck_b"]
const OUTPUTS = ["monitor", "master"]
const CHANNELS = ["bass", "mid", "hi"]

const init = () => {
  if (location.href.match("mixyt_role")) return

  clear_frame()

  const app_cont = document.getElementById("app-cont")
  r.render(app_cont, [app])

  let prev = state.get()

  const update_decks = () => {
    const curr = state.get()

    DECKS.forEach((deck_name) => {
      const deck = curr.mixer[deck_name]
      const { crossfade } = curr.mixer.both
      const label = deck_name.split("_")[1]
      const out_name = "out_" + label

      if (deck.rate != prev.mixer[deck_name].rate)
        state.disp(set_player_prop, {
          name: "player_" + label,
          rate: 1 + (0.5 - deck.rate) * 0.08,
        })

      OUTPUTS.forEach((out_name) => {
        if (deck[out_name] == prev.mixer[deck_name][out_name]) return

        document.querySelector(`audio.${out_name}-${label}`).volume =
          deck[out_name]
      })

      CHANNELS.forEach((eq_name) => {
        if (deck[eq_name] == prev.mixer[deck_name][eq_name]) return

        filter_chains[out_name][eq_name].gain.value =
          (0.5 - deck[eq_name]) * -80
      })

      if (crossfade != prev.mixer.both.crossfade) {
        const fader = deck_name == "deck_a" ? crossfade : 1 - crossfade

        cross_gains[out_name].gain.value = Math.log(1 + fader * 1.719)
      }
    })

    prev = curr
  }

  state.on_change(update_decks)
  update_decks()

  runtime.onMessage.addListener(handle_message)

  document.querySelector(".deck-a").contentWindow.onload = () => init_state("a")
  document.querySelector(".deck-b").contentWindow.onload = () => init_state("b")

  storage.local.get(["monitor_device", "master_device"], set_devices)
  storage.onChanged.addListener(({ monitor_device, master_device }) =>
    set_devices({
      monitor_device: monitor_device && monitor_device.newValue,
      master_device: master_device && master_device.newValue,
    })
  )
}

init()
