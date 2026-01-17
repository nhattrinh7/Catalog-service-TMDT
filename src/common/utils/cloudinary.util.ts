export function extractCloudinaryPublicId(url: string): string {
  const urlParts = url.split('/')
  const publicIdWithExtension = urlParts[urlParts.length - 1]
  const publicId = publicIdWithExtension.split('.')[0]
  const folder = urlParts[urlParts.length - 2]
  return `${folder}/${publicId}`
}

export function isCloudinaryUrl(url: string): boolean {
  return url.includes('cloudinary.com')
}