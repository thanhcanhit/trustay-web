import Image, { ImageProps } from 'next/image'
import { useMemo } from 'react'

type SrcSize = '128x128' | '256x256' | '512x512' | '1024x1024' | '1920x1080'

// Fallback sizes nếu kích thước gốc không khả dụng
const FALLBACK_SIZES: Record<SrcSize, SrcSize[]> = {
  '128x128': ['256x256', '512x512'],
  '256x256': ['512x512', '128x128'],
  '512x512': ['256x256', '1024x1024'],
  '1024x1024': ['512x512', '256x256'],
  '1920x1080': ['1024x1024', '512x512']
}

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

  // Chỉ trả về local cho danh sách ảnh public đã biết, tránh ảnh DB trùng pattern
  const trimmed = src.startsWith('/') ? src.slice(1) : src
  const PUBLIC_LOCAL_IMAGES = new Set<string>([
    'images/error-image.jpg',
    'placeholder-avatar.png',
  ])
  if (PUBLIC_LOCAL_IMAGES.has(trimmed)) return `/${trimmed}`

  const basePath = process.env.NEXT_PUBLIC_IMAGE_BASE_PATH || 'https://api.trustay.life/images'
  
  // Xử lý src để loại bỏ dấu / ở đầu và cuối
  let normalizedSrc = src
  if (normalizedSrc.startsWith('/')) {
    normalizedSrc = normalizedSrc.slice(1)
  }
  if (normalizedSrc.endsWith('/')) {
    normalizedSrc = normalizedSrc.slice(0, -1)
  }
  
  // Nếu src rỗng hoặc chỉ có dấu /, trả về empty string
  if (!normalizedSrc) {
    return ''
  }
  
  // Tách đường dẫn thành các phần
  const segments = normalizedSrc.split('/')
  const fileName = segments[segments.length - 1]
  
  // Kiểm tra xem có phải là file ảnh không
  if (!fileName || !fileName.includes('.')) {
    return normalizedSrc
  }
  
  // Lấy đường dẫn không bao gồm tên file
 // const pathWithoutFile = segments.slice(0, -1).join('/')
  
  // Tạo URL cuối cùng - luôn sử dụng basePath và chỉ thêm size + fileName
  if (basePath) {
    // Luôn tạo URL với format: basePath/size/fileName
    return `${basePath}/${size}/${fileName}`
  } else {
    // Fallback nếu không có basePath
    return `${size}/${fileName}`
  }
}

// Function để tạo fallback URLs
const createFallbackUrls = (src: string, size: SrcSize): string[] => {
  const fallbackSizes = FALLBACK_SIZES[size] || []
  return fallbackSizes.map(fallbackSize => parseImagePath(src, fallbackSize))
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
  const { parsedSrc, dimensions, fallbackUrls } = useMemo(() => {
    const parsedSrc = parseImagePath(src, srcSize)
    const fallbackUrls = createFallbackUrls(src, srcSize)
    const dimensions = width && height 
      ? { width, height }
      : getDimensions(srcSize)
    return { parsedSrc, dimensions, fallbackUrls }
  }, [src, srcSize, width, height])

  return (
    <Image
      src={parsedSrc}
      alt={alt}
      {...(fill ? { fill } : { width: dimensions.width, height: dimensions.height })}
      {...restProps}
      onError={(e) => {
        // Nếu ảnh gốc lỗi, thử fallback URLs
        const target = e.target as HTMLImageElement
        if (fallbackUrls.length > 0) {
          const nextUrl = fallbackUrls.shift()
          if (nextUrl) {
            target.src = nextUrl
          }
        }
      }}
    />
  )
}

export default SizingImage
