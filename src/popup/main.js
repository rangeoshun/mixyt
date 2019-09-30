import r from "redda/src"
const { nav, div, a, input, label, ul, li, span, img } = r.dom

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

const app_cont = document.getElementById("app-cont")
const render_app = r.render(app_cont, [app])

state.on_change(render_app)
