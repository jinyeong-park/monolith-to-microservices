const express = require("express");
const admin = require('firebase-admin');

const app = express();
const port = process.env.PORT || 8083;

// CORS configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Firebase Admin SDK initialization
// For GCP environment, use default authentication
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

const db = admin.firestore();
const inventoryDb = db;

app.use(express.json());

// Cache configuration
let cachedInventory = null;
let lastFetchTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get all inventory
app.get("/api/inventory", async (req, res) => {
  try {
    console.log('Inventory API called');
    
    // Use cache if valid
    if (cachedInventory && lastFetchTime && (Date.now() - lastFetchTime < CACHE_DURATION)) {
      console.log('Returning cached inventory');
      return res.json(cachedInventory);
    }

    console.log('Fetching inventory from Firestore');
    const snapshot = await inventoryDb.collection('inventory').get();
    const inventory = [];

    if (snapshot.empty) {
      console.log('No inventory data found');
      return res.json([]); // Return empty array if no data
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
    
    console.log(`Returning ${inventory.length} inventory items`);
    res.json(inventory);
  } catch (error) {
    console.error('Error getting inventory:', error);
    res.status(500).json({ 
      error: 'Failed to get inventory',
      message: error.message 
    });
  }
});

// Get specific product inventory
app.get("/api/inventory/:productId", async (req, res) => {
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

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "inventory", port: port });
});

// Start the server
app.listen(port, () =>
  console.log(`Inventory microservice listening on port ${port}!`)
);

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