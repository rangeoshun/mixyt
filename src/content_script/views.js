import r from "redda/src"

import {
  state,
  monitor,
  set_monitor_device,
  master,
  set_master_device
} from "./state"

const { div, audio, iframe } = r.dom

const deck = name => () => [
  iframe,
  {
    class: `deck ${name}`,
    frameBorder: "none",
    src: window.location.href.replace(/desktop/, "m") + "&mixyt_role=" + name
  }
]

const output = name => () => [audio, { class: name }]

const move_pot = name => ev => {
  const knob = document.querySelector("." + name)
  const frame = knob.parentNode
  const top = (parseInt(knob.style.top) || 0) + (ev.movementY || ev.deltaY * -1)

  if (top < 0 || top + knob.offsetHeight >= frame.offsetHeight) return

  knob.style.top = top + "px"
}

const linear_pot = name => () => {
  const handle_drag = move_pot(name)
  const clear_handle = () => {
    window.removeEventListener("mousemove", handle_drag)
    window.removeEventListener("mouseup", clear_handle)
  }

  return [
    div,
    {
      class: "pot-frame",
      onwheel: handle_drag
    },
    [
      div,
      {
        class: `pot-knob ${name}`,
        onmousedown: ev => {
          window.addEventListener("mousemove", handle_drag)
          window.addEventListener("mouseup", clear_handle)
        }
      }
    ]
  ]
}

const mixer = () => [
  div,
  { id: "mixer" },
  [div, { class: "contorl-a" }, [linear_pot("volume-a")]]
]

export const app = () => [
  div,
  { id: "app" },
  [deck("deck-a")],
  [mixer],
  [deck("deck-b")],
  [output("master-a")],
  [output("master-b")],
  [output("monitor-a")],
  [output("monitor-b")]
]
