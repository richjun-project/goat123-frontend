import { supabase } from '../lib/supabase'

interface UploadResult {
  s3_key: string
  s3_url: string
  upload_url: string
}

export const s3Service = {
  // 이미지를 S3에 직접 업로드
  async uploadImage(file: File, battleId: string, option: 'A' | 'B'): Promise<string> {
    try {
      // 1. 파일 유효성 검사
      const validation = this.validateImage(file)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // 2. 이미지 압축
      const compressedFile = await this.compressImage(file)

      // 3. Supabase 함수를 통해 S3 업로드 정보 획득
      const { data, error } = await supabase.rpc('upload_battle_image', {
        p_battle_id: battleId,
        p_option: option,
        p_file_name: file.name,
        p_file_size: compressedFile.size,
        p_mime_type: compressedFile.type
      })

      if (error) throw error

      const uploadInfo = data[0] as UploadResult

      // 4. S3에 직접 업로드 (CORS 설정 필요)
      const formData = new FormData()
      formData.append('key', uploadInfo.s3_key)
      formData.append('Content-Type', compressedFile.type)
      formData.append('file', compressedFile)

      const uploadResponse = await fetch(uploadInfo.upload_url, {
        method: 'PUT',
        body: compressedFile,
        headers: {
          'Content-Type': compressedFile.type,
        }
      })

      if (!uploadResponse.ok) {
        throw new Error('S3 업로드 실패')
      }

      return uploadInfo.s3_url
    } catch (error) {
      console.error('Error uploading to S3:', error)
      throw error
    }
  },

  // 이미지 유효성 검사
  validateImage(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: 'JPG, PNG, WebP, GIF 파일만 업로드 가능합니다.' 
      }
    }

    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: '파일 크기는 5MB 이하여야 합니다.' 
      }
    }

    return { valid: true }
  },

  // 이미지 압축
  async compressImage(file: File, maxWidth: number = 1200): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          // 최대 너비 제한
          if (width > maxWidth) {
            height = (maxWidth / width) * height
            width = maxWidth
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Canvas context 생성 실패'))
            return
          }

          // 이미지 그리기
          ctx.drawImage(img, 0, 0, width, height)

          // Blob으로 변환
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now()
                })
                resolve(compressedFile)
              } else {
                reject(new Error('이미지 압축 실패'))
              }
            },
            file.type,
            0.85 // 품질 85%
          )
        }
        img.onerror = () => reject(new Error('이미지 로드 실패'))
      }
      reader.onerror = () => reject(new Error('파일 읽기 실패'))
    })
  },

  // S3 이미지 URL에서 썸네일 URL 생성
  getThumbnailUrl(originalUrl: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
    // CloudFront나 Lambda@Edge를 통한 이미지 리사이징이 설정되어 있다면
    // 여기서 썸네일 URL을 생성할 수 있습니다
    const sizeMap = {
      small: '200x200',
      medium: '400x400',
      large: '800x800'
    }
    
    // 예시: ?size=400x400 파라미터 추가
    return `${originalUrl}?size=${sizeMap[size]}`
  },

  // 배틀의 모든 이미지 URL 가져오기
  async getBattleImages(battleId: string): Promise<{ option_a?: string; option_b?: string }> {
    try {
      const { data, error } = await supabase
        .from('battle_images')
        .select('option, s3_url')
        .eq('battle_id', battleId)

      if (error) throw error

      const images: { option_a?: string; option_b?: string } = {}
      
      data?.forEach(img => {
        if (img.option === 'A') {
          images.option_a = img.s3_url
        } else if (img.option === 'B') {
          images.option_b = img.s3_url
        }
      })

      return images
    } catch (error) {
      console.error('Error fetching battle images:', error)
      return {}
    }
  }
}