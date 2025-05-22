// upload-inventory.js - 독립 실행 스크립트
const admin = require('firebase-admin');

// 서비스 계정 키 파일 경로 (프로젝트 루트에 저장)
const serviceAccount = require('../service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'project-460422'
});

// inventory-db 데이터베이스 사용
const db = admin.firestore();
const inventoryDb = db;

// products.json에서 inventory 데이터만 추출
const productsData = require('../data/products.json');

const inventoryData = productsData.products.map(product => ({
  productId: product.id,
  productName: product.name,
  productPicture: product.picture,
  quantity: Math.floor(Math.random() * 100) + 10 // 10-109 사이 랜덤 수량
}));

// Firestore에 inventory 데이터 업로드
async function uploadInventory() {
  try {
    console.log('Starting inventory upload to Firestore...');
    
    const batch = inventoryDb.batch();
    
    inventoryData.forEach((item) => {
      const inventoryRef = inventoryDb.collection('inventory').doc(item.productId);
      batch.set(inventoryRef, item);
    });
    
    await batch.commit();
    console.log('Successfully uploaded inventory to Firestore!');
    
    // 업로드 확인
    const snapshot = await inventoryDb.collection('inventory').get();
    console.log(`Total inventory items: ${snapshot.size}`);
    
    // 업로드된 데이터 출력
    console.log('\nUploaded inventory:');
    snapshot.forEach(doc => {
      console.log(`${doc.id}:`, doc.data());
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('Error uploading inventory:', error);
    process.exit(1);
  }
}

// 스크립트 실행
uploadInventory();