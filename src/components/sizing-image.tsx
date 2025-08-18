import Image, { ImageProps } from 'next/image'
import { useMemo } from 'react'

type SrcSize = '128x128' | '256x256' | '512x512' | '1024x1024' | '1920x1080'

interface SizingImageProps extends Omit<ImageProps, 'src' | 'width' | 'height'> {
  src: string
  srcSize: SrcSize
  width?: number
  height?: number
  fill?: boolean
}

const parseImagePath = (src: string, size: SrcSize): string => {
  // Nếu là full URL thì giữ nguyên
  if (/^https?:\/\//i.test(src)) {
    return src
  }

  const basePath = process.env.NEXT_PUBLIC_IMAGE_BASE_PATH || ''
  const normalizedSrc = src.startsWith('/') ? src.slice(1) : src
  const segments = normalizedSrc.split('/')
  const fileName = segments[segments.length - 1]
  const pathWithoutFile = segments.slice(0, -1).join('/')

  if (basePath) {
    return `${basePath}/${pathWithoutFile}/${size}/${fileName}`
  }

  return `${pathWithoutFile}/${size}/${fileName}`
}

const getDimensions = (size: SrcSize): { width: number; height: number } => {
  const [width, height] = size.split('x').map(Number)
  return { width, height }
}

export const SizingImage: React.FC<SizingImageProps> = ({
  src,
  srcSize,
  width,
  height,
  alt,
  fill,
  ...restProps
}) => {
  const { parsedSrc, dimensions } = useMemo(() => {
    const parsedSrc = parseImagePath(src, srcSize)
    const dimensions = width && height 
      ? { width, height }
      : getDimensions(srcSize)
    return { parsedSrc, dimensions }
  }, [src, srcSize, width, height])

  return (
    <Image
      src={parsedSrc}
      alt={alt}
      {...(fill ? { fill } : { width: dimensions.width, height: dimensions.height })}
      {...restProps}
    />
  )
}

export default SizingImage
