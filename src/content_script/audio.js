export const connect_node = (src_stream, dest_elem) => {
  const ac = new AudioContext()
  const src = ac.createMediaStreamSource(src_stream)
  const dest = ac.createMediaStreamDestination()
  src.connect(dest)

  dest_elem.srcObject = dest.stream
  dest_elem.play()
  return ac
}
