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
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import Popularproducts from "../PopularProducts";

export default function Products() {
  const [hasErrors, setErrors] = useState(false);
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]); // 추가된 상태

  async function fetchData() {
    try {
      const response = await fetch(`${process.env.REACT_APP_PRODUCTS_URL}`);
      const products = await response.json();
      setProducts(products);
    } catch (err) {
      setErrors(true);
    }
  }

  async function fetchRecommendations() {
    try {
      const response = await fetch(`${process.env.REACT_APP_RECOMMEND_URL}?type=popular&limit=4`);
      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error('추천 상품 로드 실패:', err);
      setRecommendations([]);
    }
  }

  useEffect(() => {
    fetchData();
    fetchRecommendations();
  }, []);

  return (
    <Box sx={{ flexGrow: 1 }}>
      {hasErrors && (
        <Paper
          elevation={3}
          sx={{
            background: "#f99",
            padding: (theme) => theme.spacing(3, 2),
          }}
        >
          <Typography component="p">
            An error has occurred, please try reloading the page.
          </Typography>
        </Paper>
      )}
      {!hasErrors && (
        <>
          <Grid
            sx={{ maxWidth: "1000px", margin: "0 auto" }}
            container
            spacing={3}
            justify="flex-start"
            alignItems="stretch"
          >
            {products.map((product) => (
              <Grid key={product.id} item md={4} xs={12}>
                <Card>
                  <CardMedia
                    sx={{ height: 0, paddingTop: "56.25%" }}
                    image={product.picture}
                    title={product.name}
                  />
                  <CardContent>
                    <Typography variant="body1">
                      {product.name} - ${product.cost}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ mt: 4, mb: 2 }}>
          <Popularproducts />
          </Box>
        </>
      )}
    </Box>
  );
}