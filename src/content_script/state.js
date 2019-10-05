import r from "redda/src"

export const state = r.state()

const set_out = ({ out_a, out_b }, next) => ({
  out_a: next.out_a || out_a,
  out_b: next.out_b || out_b
})

const set_src = ({ out_a, out_b }, { src_a, src_b }) => {
  if (out_a && src_a) {
    out_a.srcObject = src_a
    out_a.play()
  }

  if (out_b && src_b) {
    out_b.srcObject = src_b
    out_b.play()
  }

  return { out_a, out_b }
}

const set_device = ({ out_a, out_b }, device) => {
  if (out_a) {
    out_a.pause()
    out_a.setSinkId(device)
    out_a.play()
  }
  if (out_b) {
    out_b.pause()
    out_b.setSinkId(device)
    out_b.play()
  }

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
  device: null
})

export const set_monitor = (prev, next) => set_out(prev, next)

export const set_monitor_src = (chan, src) => set_src(chan, src)

export const set_monitor_device = (chan, device) => set_device(chan, device)

state.add(monitor, set_monitor, set_monitor_src, set_monitor_device)

export const master = () => ({
  out_a: null,
  out_b: null,
  device: null
})

export const set_master = (prev, next) => set_out(prev, next)

export const set_master_src = (chan, src) => set_src(chan, src)

export const set_master_device = (chan, device) => set_device(chan, device)

state.add(master, set_master, set_master_src, set_master_device)

export const players = () => ({
  player_a: null,
  player_b: null
})

export const set_player = ({ player_a, player_b }, players) => ({
  player_a: players.player_a || player_a,
  player_b: players.player_b || player_b
})

export const set_player_prop = (players, props) => set_prop(players, props)

state.add(players, set_player, set_player_prop)
