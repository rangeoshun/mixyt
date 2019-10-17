const contexts = {}
const create_context = name =>
  (contexts[name] = new AudioContext({
    latencyHint: "playback",
    sampleRate: 44100
  }))

const destinations = {}
const create_destination = (name, role) =>
  (destinations[`${name}_${role}`] = contexts[
    name
  ].createMediaStreamDestination())

export const filter_chains = {}
const create_eq_chain = name => {
  const ac = contexts[name]

  const bass = ac.createBiquadFilter()
  const mid = ac.createBiquadFilter()
  const hi = ac.createBiquadFilter()

  bass.type = "lowshelf"
  bass.frequency.value = 150
  mid.type = "peaking"
  mid.frequency.value = 1000
  mid.Q.value = 0.5
  hi.type = "highshelf"
  hi.frequency.value = 3000

  bass.connect(mid)
  mid.connect(hi)

  const chain = {
    bass,
    mid,
    hi
  }

  filter_chains[name] = chain

  return chain
}

export const cross_gains = {}
const create_cross_gain = name =>
  (cross_gains[name] = contexts[name].createGain())

export const get_source = (name, src_stream) =>
  (contexts[name] || create_context(name)).createMediaStreamSource(src_stream)

export const connect_node = (name, src, dest_elem, role) => {
  const ac = contexts[name] || create_context(name)
  const dest = destinations[`${name}_${role}`] || create_destination(name, role)
  const eq = filter_chains[name] || create_eq_chain(name)
  const gain = cross_gains[name] || create_cross_gain(name)

  src.connect(eq.bass)
  if (role == "master") {
    eq.hi.connect(gain)
    gain.connect(dest)
  } else if (role == "monitor") {
    eq.hi.connect(dest)
  }

  dest_elem.srcObject = dest.stream
  dest_elem.play()
}
