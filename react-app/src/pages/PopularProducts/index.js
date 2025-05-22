import React, { useState, useEffect } from 'react';
import './Popularproducts.css';

function Popularproducts() {
  const [functionUrl, setFunctionUrl] = useState('');
  const [limit, setLimit] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState('');
  const [realTimeRecommendations, setRealTimeRecommendations] = useState([]);

  // 기본 인기 제품 데이터 (요청된 제품으로 교체)
  const defaultRecommendations = [
    {
      id: '0PUK6V6EV0',
      name: 'Vintage Record Player',
      description: 'It still works.',
      picture: 'https://storage.cloud.google.com/fancystore-products/record-player.jpg',
      cost: 67.99,
      categories: ['music', 'vintage'],
    },
    {
      id: 'L9ECAV7KIM',
      name: 'Terrarium',
      description: 'This terrarium will looks great in your white painted living room.',
      picture: 'https://storage.cloud.google.com/fancystore-products/terrarium.jpg',
      cost: 36.45,
      categories: ['gardening'],
    },
  ];

  const fetchPopularProducts = async () => {
    if (!functionUrl) {
      setError('Please enter the Cloud Function URL.');
      setRealTimeRecommendations([]);
      setStats('');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setStats('');
      setRealTimeRecommendations([]);

      const url = new URL(functionUrl);
      url.searchParams.append('type', 'popular');
      url.searchParams.append('limit', limit);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.recommendations || data.recommendations.length === 0) {
        setStats('');
        setRealTimeRecommendations([]);
      } else {
        setStats(`📊 Found ${data.total} popular products.`);
        setRealTimeRecommendations(data.recommendations);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setRealTimeRecommendations([]);
    setStats('');
  }, []);

  return (
    <div className="container">
      <h1>🔥 Popular Products</h1>

      <div className="url-section">
        <div className="url-label">⚙️ Cloud Function URL</div>
        <input
          type="text"
          className="url-input"
          placeholder="https://REGION-PROJECT_ID.cloudfunctions.net/recommendProducts"
          value={functionUrl}
          onChange={(e) => setFunctionUrl(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && fetchPopularProducts()}
        />
        <small style={{ color: '#6c757d' }}>
          Enter your deployed Cloud Function URL to fetch real-time popular products.
        </small>
      </div>

      <div className="controls">
        <input
          type="number"
          className="limit-input"
          placeholder="Count"
          value={limit}
          min="1"
          max="9"
          onChange={(e) => setLimit(Number(e.target.value))}
          onKeyPress={(e) => e.key === 'Enter' && fetchPopularProducts()}
        />
        <button
          className="fetch-button"
          onClick={fetchPopularProducts}
          disabled={loading}
        >
          Get Real-Time Popular Products
        </button>
      </div>

      {loading && <div className="loading">⏳ Fetching real-time popular products...</div>}

      {error && (
        <div className="error">
          <strong>❌ Error:</strong> {error}
          <br /><small>Please check if your Cloud Function URL is correct and the function is deployed.</small>
        </div>
      )}

      {/* Real-Time Popular Products Section */}
      {realTimeRecommendations.length > 0 && (
        <>
          <h2>🌟 Real Time Popular Products</h2>
          {stats && <div className="stats">{stats}</div>}
          <div className="products-grid">
            {realTimeRecommendations.map((product, index) => (
              <div className="product-card" key={`real-time-${index}`}>
                <img
                  src={product.picture}
                  alt={product.name}
                  className="product-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.paddingTop = '40px';
                  }}
                />
                <div className="product-info">
                  <div className="product-name">{product.name}</div>
                  <div className="product-price">${product.cost.toFixed(2)}</div>
                  <div className="product-description">{product.description}</div>
                  <div className="product-categories">
                    {product.categories.map((cat, i) => (
                      <span key={i} className="category-tag">{cat}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Default Popular Products Section (only shown when no real-time data) */}
      {realTimeRecommendations.length === 0 && (
        <div style={{ marginTop: '3rem' }}>
          <h3>📈 Popular Products</h3>
          <div className="products-grid">
            {defaultRecommendations.length > 0 ? (
              defaultRecommendations.map((product, index) => (
                <div className="product-card" key={`default-${index}`}>
                  <img
                    src={product.picture}
                    alt={product.name}
                    className="product-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.paddingTop = '40px';
                    }}
                  />
                  <div className="product-info">
                    <div className="product-name">{product.name}</div>
                    <div className="product-price">${product.cost.toFixed(2)}</div>
                    <div className="product-description">{product.description}</div>
                    <div className="product-categories">
                      {product.categories.map((cat, i) => (
                        <span key={i} className="category-tag">{cat}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <h3>😅 No default products available</h3>
                <p>Please try again later.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Popularproducts;