const IMAGE_BASE_URL = 'http://localhost:8080'

export function getTeacherImageValue(source) {
  if (!source) {
    return ''
  }

  return (
    source.imageUrl ||
    source.teacherImageUrl ||
    source.profileImageUrl ||
    source.teacher?.imageUrl ||
    source.teacher?.teacherImageUrl ||
    source.teacher?.profileImageUrl ||
    ''
  )
}

export function getTeacherImageSrc(imageUrl) {
  if (!imageUrl) {
    return null
  }

  if (imageUrl.startsWith('http')) {
    return imageUrl
  }

  const normalized = imageUrl.startsWith('/')
    ? imageUrl
    : `/${imageUrl}`

  return `${IMAGE_BASE_URL}${normalized}`
}
