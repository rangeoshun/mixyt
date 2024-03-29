import r from "redda/src"

import { connect_node } from "./audio"

export const state = r.state()

const set_out = ({ out_a, out_b }, next) => ({
  out_a: next.out_a || out_a,
  out_b: next.out_b || out_b,
})

const set_src = ({ out_a, out_b, src_a, src_b }, input, role) => {
  if (out_a && input.src_a)
    src_a = connect_node("out_a", input.src_a, out_a, role)
  if (out_b && input.src_b)
    src_b = connect_node("out_b", input.src_b, out_b, role)

  return { out_a, out_b, src_a, src_b }
}

const set_device = ({ out_a, out_b }, device) => {
  if (out_a) out_a.setSinkId(device)
  if (out_b) out_b.setSinkId(device)

  return { out_a, out_b, device }
}

const set_prop = (players, { name, muted, volume, rate, crossorigin, src }) => {
  const player = players[name]

  if (crossorigin) player.setAttribute("crossOrigin", crossorigin)
  if (src) player.src = src
  if (muted != undefined) player.muted = muted
  if (volume != undefined) player.volume = volume
  if (rate != undefined) player.playbackRate = rate

  return players
}

export const monitor = () => ({
  out_a: null,
  out_b: null,
  device: null,
})

export const set_monitor = (prev, next) => set_out(prev, next)

export const set_monitor_src = (chan, src) => set_src(chan, src, "monitor")

export const set_monitor_device = (chan, device) => set_device(chan, device)

state.add(monitor, set_monitor, set_monitor_src, set_monitor_device)

export const master = () => ({
  out_a: null,
  out_b: null,
  device: null,
})

export const set_master = (prev, next) => set_out(prev, next)

export const set_master_src = (chan, src) => set_src(chan, src, "master")

export const set_master_device = (chan, device) => set_device(chan, device)

state.add(master, set_master, set_master_src, set_master_device)

export const players = () => ({
  player_a: null,
  player_b: null,
})

export const set_player = ({ player_a, player_b }, players) => ({
  player_a: players.player_a || player_a,
  player_b: players.player_b || player_b,
})

export const set_player_prop = (players, props) => set_prop(players, props)

state.add(players, set_player, set_player_prop)

const deck_default = {
  master: 1,
  monitor: 0.5,
  rate: 0.5,
  bass: 0.5,
  mid: 0.5,
  hi: 0.5,
}

export const mixer = () => ({
  deck_a: deck_default,
  deck_b: deck_default,
  both: {
    crossfade: 0.5,
  },
})

export const set_deck = (
  decks,
  { name, master, monitor, rate, bass, mid, hi, crossfade }
) => {
  let deck = decks[name]

  if (master != undefined) deck = { ...deck, master }
  if (monitor != undefined) deck = { ...deck, monitor }
  if (rate != undefined) deck = { ...deck, rate }
  if (bass != undefined) deck = { ...deck, bass }
  if (mid != undefined) deck = { ...deck, mid }
  if (hi != undefined) deck = { ...deck, hi }
  if (crossfade != undefined) deck = { ...deck, crossfade }

  return { ...decks, [name]: deck }
}

state.add(mixer, set_deck)
