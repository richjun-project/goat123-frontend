import { supabase } from '../lib/supabase'

const BUCKET_NAME = 'battle-images'

export const storageService = {
  // 이미지 업로드
  async uploadImage(file: File, battleId: string, option: 'A' | 'B'): Promise<string> {
    try {
      // 파일 확장자 추출
      const fileExt = file.name.split('.').pop()
      const fileName = `${battleId}_option_${option}_${Date.now()}.${fileExt}`
      const filePath = `battles/${fileName}`

      // Supabase Storage에 업로드
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // 공개 URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  },

  // 이미지 삭제
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // URL에서 파일 경로 추출
      const url = new URL(imageUrl)
      const pathParts = url.pathname.split('/')
      const filePath = pathParts.slice(pathParts.indexOf(BUCKET_NAME) + 1).join('/')

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath])

      if (error) throw error
    } catch (error) {
      console.error('Error deleting image:', error)
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

  // 이미지 압축 (브라우저에서)
  async compressImage(file: File, maxWidth: number = 800): Promise<File> {
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

          if (width > maxWidth) {
            height = (maxWidth / width) * height
            width = maxWidth
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)

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
      }
    })
  }
}

// Storage 버킷 초기 설정 SQL
export const STORAGE_SETUP_SQL = `
-- Storage 버킷 생성 (Supabase Dashboard에서 실행)
-- 1. Storage 탭으로 이동
-- 2. New Bucket 클릭
-- 3. 이름: battle-images
-- 4. Public bucket 체크
-- 5. Create bucket 클릭

-- RLS 정책 설정
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'battle-images');

CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'battle-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'battle-images' 
    AND auth.role() = 'authenticated'
  );
`