const functions = require('@google-cloud/functions-framework');

// const products = require('./products.json').products;

const products = [
    {
        "id": "OLJCESPC7Z",
        "name": "Vintage Typewriter",
        "description": "This typewriter looks good in your living room.",
        "picture": "https://storage.cloud.google.com/fancystore-products/typewriter.jpg",
        "cost": 67.99,
        "categories": ["vintage"]
    },
    {
        "id": "66VCHSJNUP",
        "name": "Vintage Camera Lens",
        "description": "You won't have a camera to use it and it probably doesn't work anyway.",
        "picture": "https://storage.cloud.google.com/fancystore-products/camera-lens.jpg",
        "cost": 12.49,
        "categories": ["photography", "vintage"]
    },
    {
        "id": "1YMWWN1N4O",
        "name": "Home Barista Kit",
        "description": "Always wanted to brew coffee with Chemex and Aeropress at home?",
        "picture": "https://storage.cloud.google.com/fancystore-products/barista-kit.jpg",
        "cost": 124,
        "categories": ["cookware"]
    },
    {
        "id": "L9ECAV7KIM",
        "name": "Terrarium",
        "description": "This terrarium will looks great in your white painted living room.",
        "picture": "https://storage.cloud.google.com/fancystore-products/terrarium.jpg",
        "cost": 36.45,
        "categories": ["gardening"]
    },
    {
        "id": "2ZYFJ3GM2N",
        "name": "Film Camera",
        "description": "This camera looks like it's a film camera, but it's actually digital.",
        "picture": "https://storage.cloud.google.com/fancystore-products/film-camera.jpg",
        "cost": 2245,
        "categories": ["photography", "vintage"]
    },
    {
        "id": "0PUK6V6EV0",
        "name": "Vintage Record Player",
        "description": "It still works.",
        "picture": "https://storage.cloud.google.com/fancystore-products/record-player.jpg",
        "cost": 65.50,
        "categories": ["music", "vintage"]
    },
    {
        "id": "LS4PSXUNUM",
        "name": "Metal Camping Mug",
        "description": "You probably don't go camping that often but this is better than plastic cups.",
        "picture": "https://storage.cloud.google.com/fancystore-products/camp-mug.jpg",
        "cost": 24.33,
        "categories": ["cookware"]
    },
    {
        "id": "9SIQT8TOJO",
        "name": "City Bike",
        "description": "This single gear bike probably cannot climb the hills of San Francisco.",
        "picture": "https://storage.cloud.google.com/fancystore-products/city-bike.jpg",
        "cost": 789.50,
        "categories": ["cycling"]
    },
    {
        "id": "6E92ZMYYFZ",
        "name": "Air Plant",
        "description": "Have you ever wondered whether air plants need water? Buy one and figure out.",
        "picture": "https://storage.cloud.google.com/fancystore-products/air-plant.jpg",
        "cost": 12.30,
        "categories": ["gardening"]
    }
];

// 추천 알고리즘 함수들
function getRecommendationsByCategory(productId, limit = 3) {
  const product = products.find(p => p.id === productId);
  if (!product) return [];

  return products
    .filter(p => p.id !== productId)
    .map(p => {
      const commonCategories = p.categories.filter(category => product.categories.includes(category));
      return { ...p, similarity: commonCategories.length };
    })
    .filter(p => p.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

function getRecommendationsByPriceRange(productId, limit = 3) {
  const product = products.find(p => p.id === productId);
  if (!product) return [];

  const priceRange = product.cost * 0.3; // 30% 가격 범위
  
  return products
    .filter(p => p.id !== productId)
    .filter(p => Math.abs(p.cost - product.cost) <= priceRange)
    .sort(() => Math.random() - 0.5) // 랜덤 정렬
    .slice(0, limit);
}

function getPopularProducts(limit = 5) {
  // 실제로는 구매/조회 데이터 기반으로 정렬
  // 여기서는 가격 기준으로 인기도 시뮬레이션
  return products
    .sort((a, b) => {
      // 중간 가격대 제품들이 더 인기있다고 가정
      const aScore = Math.abs(a.cost - 100);
      const bScore = Math.abs(b.cost - 100);
      return aScore - bScore;
    })
    .slice(0, limit);
}

functions.http('recommendProducts', async (req, res) => {
  // CORS 헤더 설정
  res.set('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  try {
    const { category, maxPrice, limit = 3, productId, type } = req.query;
    let recommendedProducts = [];

    // 추천 타입에 따른 처리
    if (type === 'category' && productId) {
      recommendedProducts = getRecommendationsByCategory(productId, parseInt(limit));
    } else if (type === 'price' && productId) {
      recommendedProducts = getRecommendationsByPriceRange(productId, parseInt(limit));
    } else if (type === 'popular') {
      recommendedProducts = getPopularProducts(parseInt(limit));
    } else {
      // 기본 필터링 방식
      recommendedProducts = [...products];

      // 카테고리 필터링
      if (category) {
        recommendedProducts = recommendedProducts.filter(product => 
          product.categories.includes(category)
        );
      }

      // 가격 필터링
      if (maxPrice) {
        recommendedProducts = recommendedProducts.filter(product => 
          product.cost <= parseFloat(maxPrice)
        );
      }

      // 랜덤 선택
      recommendedProducts = recommendedProducts
        .sort(() => Math.random() - 0.5)
        .slice(0, parseInt(limit));
    }

    res.json({
      recommendations: recommendedProducts,
      total: recommendedProducts.length
    });

  } catch (error) {
    console.error('Error in recommendProducts:', error);
    res.status(500).json({
      error: 'Failed to get recommendations',
      message: error.message
    });
  }
});