const ac = new AudioContext()

export const get_source = src_stream => ac.createMediaStreamSource(src_stream)

export const connect_node = (src, dest_elem) => {
  const dest = ac.createMediaStreamDestination()
  src.connect(dest)

  dest_elem.srcObject = dest.stream
  dest_elem.play()
  return ac
}
