/*
Copyright 2019 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const express = require("express");
const path = require("path");
const admin = require('firebase-admin');

const app = express();
const port = process.env.PORT || 8080;

// GCP 환경에서는 기본 인증 사용
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

// CORS 설정 추가
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Firebase Admin SDK 초기화
const serviceAccount = require("../service-account-key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'project-460422'
});

const db = admin.firestore();
// default 데이터베이스 사용
const inventoryDb = db;

//Load orders and products for pseudo database
const orders = require("../data/orders.json").orders;
const products = require("../data/products.json").products;

//Serve website
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.json()); // JSON 파싱 미들웨어 추가

//Get all products
app.get("/service/products", (req, res) => res.json(products));

//Get products by ID
app.get("/service/products/:id", (req, res) =>
  res.json(products.find((product) => product.id === req.params.id))
);

//Get all orders
app.get("/service/orders", (req, res) => res.json(orders));

//Get orders by ID
app.get("/service/orders/:id", (req, res) =>
  res.json(orders.find((order) => order.id === req.params.id))
);

// ===== INVENTORY API 추가 =====

// 모든 재고 조회
let cachedInventory = null;
let lastFetchTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5분

app.get("/service/inventory", async (req, res) => {
  try {
    // 캐시가 있고 유효한 경우
    if (cachedInventory && lastFetchTime && (Date.now() - lastFetchTime < CACHE_DURATION)) {
      return res.json(cachedInventory);
    }

    const snapshot = await inventoryDb.collection('inventory').get();
    const inventory = [];

    if (snapshot.empty) {
    
      return res.json([]); // 데이터가 없을 경우 빈 배열 반환
    }
    
    snapshot.forEach(doc => {
      const data = doc.data();
      inventory.push({
        productId: doc.id,
        productName: data.productName,
        productPicture: data.productPicture,
        quantity: data.quantity
      });
    });
    
    cachedInventory = inventory;
    lastFetchTime = Date.now();
    
    res.json(inventory);
  } catch (error) {
    console.error('Error getting inventory:', error);
    res.status(500).json({ 
      error: 'Failed to get inventory',
      message: error.message 
    });
  }
});

// 특정 제품 재고 조회
app.get("/service/inventory/:productId", async (req, res) => {
  try {
    const doc = await inventoryDb.collection('inventory').doc(req.params.productId).get();
    
    if (!doc.exists) {
      return res.status(404).json({ 
        error: 'Product not found in inventory',
        productId: req.params.productId 
      });
    }
    
    const data = doc.data();
    res.json({
      productId: doc.id,
      productName: data.productName,
      productPicture: data.productPicture,
      quantity: data.quantity
    });
  } catch (error) {
    console.error('Error getting product inventory:', error);
    res.status(500).json({ 
      error: 'Failed to get product inventory',
      message: error.message 
    });
  }
});



//Client side routing fix on page refresh or direct browsing to non-root directory
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"), (err) => {
    if (err) {
      res.status(500).send(err);
    }
  });
});

//Start the server
app.listen(port, () => console.log(`Monolith listening on port ${port}!`));
