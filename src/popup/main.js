import r from "redda/src"
const { nav, div, a, input, label, ul, li, span } = r.dom

const state = r.state()
const is_on = () => false
const toggle = prev => !prev

state.add(is_on, toggle)

const switcher = state.conn(
  ({ is_on }) => [
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
          checked: is_on ? "checked" : null,
          onclick: () => state.disp(toggle)
        }
      ],
      [span, { class: "lever" }],
      "On"
    ]
  ],
  is_on
)

const title_bar = () => [
  nav,
  [
    div,
    { class: "nav-wrapper" },
    [div, { class: "container" }, [a, { class: "brand-logo" }, "MixYT"]]
  ]
]

const app = () => [
  div,
  { id: "app" },
  [title_bar],
  [div, { class: "section" }, [div, { class: "container" }, [switcher]]]
]

const app_cont = document.getElementById("app-cont")
const render_app = r.render(app_cont, [app])

state.on_change(render_app)
