import r from "redda/src"
import {
  state,
  is_on,
  toggle,
  active_tab,
  devices,
  set_master,
  set_monitor
} from "./state"

const { nav, div, a, input, label, span, img, select, option } = r.dom

const switcher = state.conn(
  ({ is_on, active_tab }) => {
    active_tab = active_tab || {}

    return [
      div,
      {
        class: "switch center-align"
      },
      [
        label,
        "Off",
        [
          input,
          {
            type: "checkbox",
            disabled: !active_tab.is_youtube ? "disabled" : null,
            checked: is_on ? "checked" : null,
            onclick: active_tab.is_youtube ? () => state.disp(toggle) : null
          }
        ],
        [span, { class: "lever" }],
        "On"
      ]
    ]
  },
  is_on,
  active_tab
)

const title_bar = () => [
  nav,
  [
    div,
    { class: "nav-wrapper" },
    [
      div,
      { class: "container" },
      [
        a,
        { class: "brand-logo" },
        [img, { src: "images/icon_32.png" }],
        [span, "MixYT"]
      ]
    ]
  ]
]

const attrs = () => [
  div,
  "Icons made by ",

  [
    a,
    { href: "https://www.flaticon.com/authors/freepik", title: "Freepik" },
    "Freepik "
  ],
  "from ",
  [
    a,
    { href: "https://www.flaticon.com/", title: "Flaticon" },
    "www.flaticon.com"
  ]
]

const device_select = is_master => {
  const action = is_master ? set_master : set_monitor

  return state.conn(
    ({ is_on, devices }) => {
      const { list, monitor, master } = devices || {}
      const device_id = is_master ? master : monitor
      return [
        div,
        { class: "input-field" },
        [
          select,
          {
            disabled: !is_on ? "disabled" : null,
            onchange: ev => {
              const id = ev.target.value

              if (device_id != id) state.disp(action, id)
            }
          },
          [
            option,
            {
              value: "",
              disabled: "disabled",
              selected: !device_id ? "selected" : null
            },
            "Select device"
          ],
          ...list.map(({ id, label }) => [
            option,
            { value: id, selected: device_id == id ? "selected" : null },
            label
          ])
        ],
        [label, `${is_master ? "Master" : "Monitor"} output device`]
      ]
    },
    is_on,
    devices
  )
}

const monitor_select = device_select(false)
const master_select = device_select(true)

export const app = () => [
  div,
  { id: "app" },
  [title_bar],
  [
    div,
    { class: "container" },
    [div, { class: "section" }, [switcher]],
    [div, { class: "section" }, [monitor_select]],
    [div, { class: "section" }, [master_select]],
    [div, { class: "section" }, [attrs]]
  ]
]
