export const createPresignedUrlHandler = () => {
  const generatePresignedUrl = async (
    _key: string,
    _expirationSeconds: number = 3600
  ): Promise<string> => ''

  return { generatePresignedUrl }
}
