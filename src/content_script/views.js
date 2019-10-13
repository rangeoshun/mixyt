import r from "redda/src"

import {
  state,
  monitor,
  set_monitor_device,
  master,
  set_master_device,
  mixer,
  set_deck
} from "./state"

const { div, audio, span, iframe } = r.dom

const deck = name => () => [
  iframe,
  {
    class: `deck ${name}`,
    frameBorder: "none",
    src: window.location.href.replace(/desktop/, "m") + "&mixyt_role=" + name
  }
]

const output = name => () => [audio, { class: name }]

const move_pot = (klass, dest, role) => ev => {
  const knob = document.querySelector("." + klass)
  const frame = knob.parentNode
  let top = (parseInt(knob.style.top) || 0) + (ev.movementY || ev.deltaY * -1)

  if (top < 10) top = 10
  else if (top > 240) top = 240

  knob.style.top = top + "px"
  state.disp(set_deck, { name: dest, [role]: 1 - (top - 10) / 230 })
}

const linear_pot = (dest, role) =>
  state.conn(({ mixer }) => {
    const klass = `${dest}-${role}`
    const handle_drag = move_pot(klass, dest, role)

    const clear_handle = () => {
      window.removeEventListener("mousemove", handle_drag)
      window.removeEventListener("mouseup", clear_handle)
    }

    return [
      div,
      {
        class: "pot-frame linear",
        onwheel: handle_drag
      },
      [
        div,
        {
          class: `pot-knob linear ${klass}`,
          style: { top: 240 - mixer.deck_a[role] * 240 + "px" },
          onmousedown: ev => {
            window.addEventListener("mousemove", handle_drag)
            window.addEventListener("mouseup", clear_handle)
          }
        }
      ],
      [span, role.toUpperCase()]
    ]
  }, mixer)

const rotate_pot = (klass, dest, role) => ev => {
  const knob = document.querySelector("." + klass)
  const frame = knob.parentNode
  let ang =
    (parseInt(knob.style.transform.split("(")[1]) || 0) -
    (ev.movementY || ev.deltaY * -1)

  if (ang < -135) ang = -135
  else if (ang > 135) ang = 135

  knob.style.transform = `rotateZ(${ang}deg)`
  state.disp(set_deck, {
    name: dest,
    [role]: parseInt(((ang + 137) / 270) * 100) / 100
  })
}

const radial_pot = (dest, role) =>
  state.conn(({ mixer }) => {
    const klass = `${dest}-${role}`
    const handle_drag = rotate_pot(klass, dest, role)

    const clear_handle = () => {
      window.removeEventListener("mousemove", handle_drag)
      window.removeEventListener("mouseup", clear_handle)
    }

    return [
      div,
      {
        class: "pot-frame radial",
        onwheel: handle_drag
      },
      [
        div,
        {
          class: `pot-knob radial ${klass}`,
          style: {
            transform: `rotateZ(${(mixer.deck_a[role] - 0.5) * 270}deg)`
          },
          onmousedown: ev => {
            window.addEventListener("mousemove", handle_drag)
            window.addEventListener("mouseup", clear_handle)
          }
        }
      ],
      [span, role.toUpperCase()]
    ]
  }, mixer)

const controls = (name, deck) => [
  div,
  { class: `${name} controls` },
  [linear_pot(deck, "rate")],
  [radial_pot(deck, "monitor")],
  [radial_pot(deck, "hi")],
  [radial_pot(deck, "mid")],
  [radial_pot(deck, "bass")],
  [linear_pot(deck, "master")]
]

const mixer_cont = () => [
  div,
  { id: "mixer" },
  [controls("controls-a", "deck_a")],
  [div, { class: "controls-spacer" }],
  [controls("controls-b", "deck_b")]
]

export const app = () => [
  div,
  { id: "app" },
  [deck("deck-a")],
  [mixer_cont],
  [deck("deck-b")],
  [output("master-a")],
  [output("master-b")],
  [output("monitor-a")],
  [output("monitor-b")]
]
