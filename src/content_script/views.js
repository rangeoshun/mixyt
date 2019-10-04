import r from "redda/src"

import {
  state,
  monitor,
  set_monitor_device,
  master,
  set_master_device,
  devices
} from "./state"

const { div, audio, iframe, label, select, option, link, script } = r.dom

const deck = name => () => [
  iframe,
  {
    class: `deck ${name}`,
    frameBorder: "none",
    src: window.location.href.replace(/desktop/, "m") + "&mixyt_role=" + name
  }
]

const output = name => () => [audio, { class: name }]

const device_select = is_master =>
  state.conn(
    ({ devices, monitor, master }) => [
      div,
      [
        div,
        { class: "input-field col s12" },
        [
          select,
          [
            option,
            { value: "", disabled: "disabled", selected: "selected" },
            "Choose device"
          ]
        ],
        [label, is_master ? "Master" : "Monitor", " output device"]
      ]
    ],
    devices,
    monitor,
    master
  )

const mixer = () => [
  div,
  { id: "mixer" },
  [device_select(true)],
  [device_select(false)]
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
