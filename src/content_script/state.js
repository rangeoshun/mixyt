import r from "redda/src"

export const state = r.state()

export const master = () => ({
  out_a: null,
  out_b: null
})

export const set_master = ({ out_a, out_b }, master) => ({
  out_a: master.out_a || out_a,
  out_b: master.out_b || out_b
})

export const set_master_src = ({ out_a, out_b }, { src_a, src_b }) => {
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

state.add(master, set_master, set_master_src)

export const players = () => ({
  player_a: null,
  player_b: null
})

export const set_player = ({ player_a, player_b }, players) => ({
  player_a: players.player_a || player_a,
  player_b: players.player_b || player_b
})

export const set_player_prop = (
  players,
  { name, muted, volume, playback_rate }
) => {
  const player = players[name]

  if (volume != undefined) player.muted = muted
  if (volume != undefined) player.volume = volume
  if (playback_rate != undefined) player.playbackRate = playback_rate

  return players
}

state.add(players, set_player, set_player_prop)
