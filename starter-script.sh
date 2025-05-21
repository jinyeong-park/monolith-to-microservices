#!/bin/bash

# 시스템 업데이트 및 필요한 패키지 설치
apt-get update
apt-get install -y curl git ufw

# Node.js 설치 (16.x 버전)
curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
apt-get install -y nodejs

# 작업 디렉토리로 이동
mkdir -p /opt/monolith-app
cd /opt/monolith-app

# 현재 프로젝트 코드 클론
git clone https://github.com/GoogleCloudPlatform/monolith-to-microservices.git
cd monolith-to-microservices/monolith

# 의존성 설치
npm install

# React 프론트엔드 빌드
npm run build

# 환경 변수 설정
export PORT=8080

# PM2 설치 및 애플리케이션 실행
npm install -g pm2
pm2 start npm --name "monolith" -- start

# PM2 시작 스크립트 설정
pm2 startup
pm2 save

# 방화벽 규칙 설정
ufw allow 8080/tcp