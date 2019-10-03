import r from "redda/src"

export const state = r.state()

export const master = (out_a, out_b) => () => {
  out_a, out_b
}

export const set_master_src = ({ out_a, out_b }, { src_a, src_b }) => {
  if (src_a) master.out_a = null
  if (src_b) master.out_b = null

  return { out_a, out_b }
}

const get_player = name =>
  document.querySelector(name).contentDocument.querySelector("video")

export const players = (player_a, player_b) => () => {
  player_a, player_b
}

export const set_player_prop = (players, { name, volume, playback_rate }) => {
  const player = players[props.name]

  if (volume != undefined) player.volume = volume
  if (playback_rate != undefined) player.playbackRate = playback_rate

  return players
}

export const init_state = () => {
  const player_a = get_player("#deck-a")
  const player_b = get_player("#deck-b")

  const out_a = document.createElement("audio")
  const out_b = document.createElement("audio")

  state.conn(master(out_a, out_b), set_master_src)
  state.conn(players(player_a, player_b), set_player_prop)
}
