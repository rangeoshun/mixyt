import r from "redda/src"

const { nav, div, a, input, label, ul, li, span, img } = r.dom

const state = r.state()

const active_tab = () => null
const set_tab = (_, tab) => tab
const set_tab_active = (tab, is_active) => {
  const active_tab = { ...tab, is_active }

  chrome.runtime.sendMessage(ext_id, { action: "set_active", active_tab })

  return active_tab
}

state.add(active_tab, set_tab, set_tab_active)

const is_on = () => false
const set_on = (_, val) => val
const toggle = prev => {
  const is_active = !prev

  state.disp(set_tab_active, is_active)

  return is_active
}

state.add(is_on, set_on, toggle)

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

const app = () => [
  div,
  { id: "app" },
  [title_bar],
  [
    div,
    { class: "container" },
    [div, { class: "section" }, [switcher]],
    [div, { class: "section" }, [attrs]]
  ]
]

window.s = state

const store_tab = tab =>
  tab && (state.disp(set_tab, tab), state.disp(set_on, !!tab.is_active))

const ext_id = chrome.runtime.id

const init = () => {
  const app_cont = document.getElementById("app-cont")
  const render_app = r.render(app_cont, [app])

  state.on_change(render_app)

  chrome.runtime.onMessage.addListener((message, sender) => {
    if (sender.id != chrome.runtime.id) return

    if (message.action == "set_active") store_tab(message.active_tab)
  })

  chrome.runtime.sendMessage(ext_id, { action: "get_active" })
}

init()
