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

const linear_pot = () => [
  div,
  { class: "pot-frame" },
  [div, { class: "pot-knob" }]
]

const mixer = () => [
  div,
  { id: "mixer" },
  [div, { class: "contorl-a" }, [linear_pot]]
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
