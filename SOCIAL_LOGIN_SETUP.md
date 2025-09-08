# 소셜 로그인 설정 가이드

## Google 로그인 설정

### 1. Google Cloud Console 설정
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" > "사용자 인증 정보" 이동
4. "사용자 인증 정보 만들기" > "OAuth 클라이언트 ID" 선택

### 2. OAuth 2.0 클라이언트 설정
- 애플리케이션 유형: 웹 애플리케이션
- 이름: GOAT123
- 승인된 JavaScript 원본:
  - http://localhost:5173
  - http://localhost:4173
  - https://aktukgzzplggrivtnytt.supabase.co (Supabase URL)
  - [실제 배포 도메인]
  
- 승인된 리디렉션 URI:
  - https://aktukgzzplggrivtnytt.supabase.co/auth/v1/callback
  - http://localhost:5173/auth/callback (개발용)

### 3. Supabase Dashboard 설정
1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택 > Authentication > Providers
3. Google Provider 활성화
4. Google Console에서 받은 다음 정보 입력:
   - Client ID
   - Client Secret
5. Redirect URL 확인 (자동 생성됨)

## Kakao 로그인 설정

### 1. Kakao Developers 설정
1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 애플리케이션 생성
3. 앱 설정 > 플랫폼 > Web 플랫폼 등록
   - 사이트 도메인: 
     - http://localhost:5173
     - http://localhost:4173
     - https://aktukgzzplggrivtnytt.supabase.co
     - [실제 배포 도메인]

### 2. 카카오 로그인 설정
1. 제품 설정 > 카카오 로그인 활성화
2. Redirect URI 등록:
   - https://aktukgzzplggrivtnytt.supabase.co/auth/v1/callback
3. 동의 항목 설정:
   - 프로필 정보 (필수)
   - 이메일 (필수)

### 3. Supabase Custom OAuth Provider 설정
카카오는 Supabase에서 기본 제공하지 않으므로 Custom Provider 설정 필요:

1. Supabase Dashboard > Authentication > Providers
2. Custom Provider 추가
3. 다음 정보 입력:
   - Provider Name: kakao
   - Authorization URL: https://kauth.kakao.com/oauth/authorize
   - Token URL: https://kauth.kakao.com/oauth/token
   - User Info URL: https://kapi.kakao.com/v2/user/me
   - Client ID: [Kakao REST API 키]
   - Client Secret: [Kakao Client Secret]
   - Scope: profile_nickname profile_image account_email

## 필요한 정보

### Google OAuth
- [ ] Client ID
- [ ] Client Secret

### Kakao OAuth  
- [ ] REST API 키
- [ ] Client Secret (보안 > Client Secret 생성)

## 코드 수정 필요 사항

카카오 로그인을 위해 AuthContext.tsx의 signInWithKakao 함수를 다음과 같이 수정:

```typescript
const signInWithKakao = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao' as any, // custom provider
      options: {
        redirectTo: window.location.origin,
        scopes: 'profile_nickname profile_image account_email'
      }
    })
    if (error) throw error
  } catch (error: any) {
    message.error(error.message || 'Kakao 로그인에 실패했습니다')
    throw error
  }
}
```

## 테스트 체크리스트

- [ ] Google 로그인 버튼 클릭
- [ ] Google 계정 선택/로그인
- [ ] 리디렉션 후 세션 확인
- [ ] 프로필 정보 저장 확인
- [ ] Kakao 로그인 버튼 클릭
- [ ] Kakao 계정 로그인
- [ ] 리디렉션 후 세션 확인
- [ ] 프로필 정보 저장 확인

## 주의사항

1. 개발 환경과 프로덕션 환경의 URL을 모두 등록해야 합니다
2. Client Secret은 절대 프론트엔드 코드에 포함하지 마세요
3. Supabase Dashboard에서만 관리하세요
4. 카카오 로그인의 경우 사업자 등록이 필요할 수 있습니다