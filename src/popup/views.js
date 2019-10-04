import r from "redda/src"
import { state, is_on, toggle, active_tab, devices } from "./state"

const { nav, div, a, input, label, ul, li, span, img, select, option } = r.dom

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

const device_select = is_master =>
  state.conn(
    ({ devices }) => [
      div,
      { class: "input-field" },
      [
        select,
        [
          option,
          { value: "", disabled: "disabled", selected: "selected" },
          "Choose device"
        ],
        devices.map(({ id, label }) => [option, { value: id }, label])
      ],
      [label, is_master ? "Master" : "Monitor", " output device"]
    ],
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
    [div, { class: "section" }, [device_select(true)]],
    [div, { class: "section" }, [device_select(false)]],
    [div, { class: "section" }, [attrs]]
  ]
]
