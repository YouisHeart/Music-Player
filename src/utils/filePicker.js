export const AUDIO_ACCEPT =
  'audio/mpeg,audio/flac,audio/wav,audio/x-wav,audio/ogg,audio/opus,audio/mp4,audio/aac,' +
  '.mp3,.flac,.wav,.m4a,.aac,.ogg,.oga,.opus,.webm'

/** Open the native file chooser and resolve with the selected files. */
export function pickAudioFiles() {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = AUDIO_ACCEPT
    input.style.position = 'fixed'
    input.style.left = '-9999px'
    input.style.opacity = '0'
    document.body.appendChild(input)

    const cleanup = () => {
      input.remove()
    }

    input.addEventListener(
      'change',
      () => {
        const files = Array.from(input.files ?? [])
        cleanup()
        resolve(files)
      },
      { once: true },
    )
    input.addEventListener(
      'cancel',
      () => {
        cleanup()
        resolve([])
      },
      { once: true },
    )

    input.click()
  })
}
