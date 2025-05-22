# 실행 방법

npm start

# 테스트 명령어들 (포트 8084)

bash# 1. 인기 상품 추천
curl "http://localhost:8084?type=popular&limit=3"

# 2. 빈티지 카테고리 + 가격 필터

curl "http://localhost:8084?category=vintage&maxPrice=100"

# 3. 특정 상품 기반 카테고리 추천

curl "http://localhost:8084?type=category&productId=OLJCESPC7Z&limit=3"

# 4. 특정 상품 기반 가격대 추천

curl "http://localhost:8084?type=price&productId=1YMWWN1N4O&limit=3"

# 5. 사진 카테고리 필터

curl "http://localhost:8084?category=photography&limit=2"

# 6. 간편 테스트 (package.json의 test 스크립트 사용)

npm test

# 브라우저에서도 테스트 가능

브라우저에서 다음 URL들을 직접 방문해서 JSON 응답을 확인할 수 있습니다:

http://localhost:8084?type=popular&limit=3
http://localhost:8084?category=vintage&maxPrice=100
http://localhost:8084?type=category&productId=OLJCESPC7Z&limit=3

# GCP Cloud Functions에 배포하는 단계별 가이드.

1. GCP 프로젝트 설정 및 gcloud CLI 설정

# gcloud CLI 인증

gcloud auth login

# 프로젝트 설정 (본인의 GCP 프로젝트 ID로 변경)

gcloud config set project YOUR_PROJECT_ID

# 현재 프로젝트 확인

gcloud config get-value project

# Cloud Functions API 활성화

gcloud services enable cloudfunctions.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# 프로젝트 설정 (본인의 GCP 프로젝트 ID로 변경)

gcloud config set project YOUR_PROJECT_ID

# 현재 프로젝트 확인

gcloud config get-value project

# Cloud Functions API 활성화

gcloud services enable cloudfunctions.googleapis.com
gcloud services enable cloudbuild.googleapis.com

2. 배포 준비 확인
   현재 디렉토리에 다음 파일들이 있는지 확인:
   ls -la

# 다음 파일들이 있어야 함:

# - index.js (추천 함수 코드)

# - package.json (포트 8084 설정된 버전)

# - node_modules/ (npm install로 생성됨)

3. Cloud Functions 배포
   bash# 기본 배포 (HTTP 트리거, 인증 불필요)
   gcloud functions deploy recommendProducts \
    --runtime nodejs18 \
    --trigger-http \
    --allow-unauthenticated \
    --entry-point recommendProducts \
    --source . \
    --timeout 60s \
    --memory 256MB

# 또는 더 상세한 설정으로 배포

gcloud functions deploy recommendProducts \
 --runtime nodejs18 \
 --trigger-http \
 --allow-unauthenticated \
 --entry-point recommendProducts \
 --source . \
 --timeout 60s \
 --memory 256MB \
 --region us-central1 \
 --max-instances 10 4. 배포 상태 확인
bash# 배포된 함수 정보 확인
gcloud functions describe recommendProducts

# nodejs20으로 업데이트 함수 방법

gcloud functions deploy recommendProducts \
 --runtime nodejs20 \
 --trigger-http \
 --allow-unauthenticated \
 --entry-point recommendProducts \
 --source . \
 --timeout 60s \
 --memory 256MB

# 함수 URL 확인

gcloud functions describe recommendProducts --format="value(httpsTrigger.url)"

5. 배포된 함수 테스트
   배포 완료 후 URL이 다음과 같은 형식으로 제공됩니다:
   https://REGION-PROJECT_ID.cloudfunctions.net/recommendProducts
   테스트 명령어:
   bash# 배포된 함수 URL을 변수로 설정 (실제 URL로 변경)
   FUNCTION_URL="https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/recommendProducts"

# 1. 인기 상품 추천 테스트

curl "${FUNCTION_URL}?type=popular&limit=3"

# 2. 카테고리 필터링 테스트

curl "${FUNCTION_URL}?category=vintage&maxPrice=100"

# 3. 특정 상품 기반 추천 테스트

curl "${FUNCTION_URL}?type=category&productId=OLJCESPC7Z&limit=3"

# 4. 가격대 추천 테스트

curl "${FUNCTION_URL}?type=price&productId=1YMWWN1N4O&limit=3" 6. 로그 확인
bash# 함수 로그 실시간 확인
gcloud functions logs tail recommendProducts

# 최근 로그 확인

gcloud functions logs read recommendProducts --limit 50 7. 함수 관리 명령어
bash# 함수 삭제 (필요시)
gcloud functions delete recommendProducts

# 함수 업데이트 (코드 수정 후)

gcloud functions deploy recommendProducts \
 --runtime nodejs18 \
 --trigger-http \
 --allow-unauthenticated \
 --entry-point recommendProducts \
 --source .
주의사항

프로젝트 ID 확인: gcloud config get-value project로 올바른 프로젝트가 설정되었는지 확인
API 활성화: Cloud Functions와 Cloud Build API가 활성화되어 있어야 함
권한 확인: 배포할 권한이 있는 계정으로 로그인했는지 확인
결제 계정: GCP 프로젝트에 결제 계정이 연결되어 있어야 함
