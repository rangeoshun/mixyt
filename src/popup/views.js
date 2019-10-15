import r from "redda/src"
import { state, is_on, turn_on, active_tab, devices } from "./state"

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
            checked: active_tab.is_active ? "checked" : null,
            onchange: active_tab.is_youtube
              ? ev => state.disp(turn_on, ev.target.checked)
              : null
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

const monitor_select = state.conn(
  ({ is_on, devices }) => [
    div,
    { class: "input-field" },
    [
      select,
      {
        disabled: !is_on ? "disabled" : null,
        onchange: ev =>
          chrome.storage.local.set({ monitor_device: ev.target.value })
      },
      [
        option,
        {
          value: "",
          disabled: "disabled",
          selected: !devices.monitor ? "selected" : null
        },
        "Select device"
      ],
      ...devices.list.map(({ id, label }) => [
        option,
        { value: id, selected: devices.monitor == id ? "selected" : null },
        label
      ])
    ],
    [label, "Monitor output device"]
  ],
  is_on,
  devices
)

const master_select = state.conn(
  ({ is_on, devices }) => [
    div,
    { class: "input-field" },
    [
      select,
      {
        disabled: !is_on ? "disabled" : null,
        onchange: ev =>
          chrome.storage.local.set({ master_device: ev.target.value })
      },
      [
        option,
        {
          value: "",
          disabled: "disabled",
          selected: !devices.master ? "selected" : null
        },
        "Select device"
      ],
      ...devices.list.map(({ id, label }) => [
        option,
        { value: id, selected: devices.master == id ? "selected" : null },
        label
      ])
    ],
    [label, "Master output device"]
  ],
  is_on,
  devices
)

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
