import r from "redda"

export const state = r.state()

const out_a = document.createElement("audio")
const out_b = docuemnt.createELement("audio")

export const master = () => {
  chan_a, chan_b
}

export const set_master_src = ({ out_a, out_b }, { src_a, src_b }) => {
  if (src_a) master.out_a = src_a
  if (src_b) master.out_b = src_b

  return { out_a, out_b }
}

state.conn(master, set_master_src)
