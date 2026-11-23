const MAX_SOURCE_BYTES = 30 * 1024 * 1024

/**
 * Turn an uploaded image into a compressed data URL that can be persisted in
 * localStorage. Images are cropped to the target aspect ratio (`cover`).
 */
export async function imageFileToDataUrl(file, { width = 1920, height = 1080, quality = 0.82 } = {}) {
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('IMAGE_TYPE')
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error('IMAGE_SIZE')
  }

  const bitmap = await loadBitmap(file)
  try {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('IMAGE_CANVAS')
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'

    // object-fit: cover
    const scale = Math.max(width / bitmap.width, height / bitmap.height)
    const drawWidth = bitmap.width * scale
    const drawHeight = bitmap.height * scale
    context.drawImage(bitmap, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight)

    let dataUrl = canvas.toDataURL('image/webp', quality)
    if (!dataUrl.startsWith('data:image/webp')) {
      dataUrl = canvas.toDataURL('image/jpeg', quality)
    }
    return dataUrl
  } finally {
    if (typeof bitmap.close === 'function') bitmap.close()
  }
}

async function loadBitmap(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      /* fall back to an <img> decode below */
    }
  }
  const url = URL.createObjectURL(file)
  try {
    const image = await new Promise((resolve, reject) => {
      const element = new Image()
      element.onload = () => resolve(element)
      element.onerror = () => reject(new Error('IMAGE_DECODE'))
      element.src = url
    })
    return image
  } finally {
    URL.revokeObjectURL(url)
  }
}
