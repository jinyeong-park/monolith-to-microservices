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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Card,
  CardMedia,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";

export default function Inventory() {
  const [hasErrors, setErrors] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const CACHE_DURATION = 5 * 60 * 1000; // 5분

  async function fetchInventory() {
    // 캐시가 유효한 경우 재호출하지 않음
    if (lastFetchTime && (Date.now() - lastFetchTime < CACHE_DURATION)) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8080/service/inventory`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const inventoryData = await response.json();
      setInventory(inventoryData);
      setLastFetchTime(Date.now());
      setErrors(false); // 성공 시 에러 상태 초기화
      setLoading(false);
    } catch (err) {
      console.error('에러:', err);
      setErrors(true);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInventory();
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '200px' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {hasErrors && (
        <Paper
          elevation={3}
          sx={{
            background: "#f99",
            padding: (theme) => theme.spacing(3, 2),
            marginBottom: 2,
          }}
        >
          <Typography component="p">
            An error has occurred, please try reloading the page.
          </Typography>
        </Paper>
      )}
      {!hasErrors && (
        <Paper
          elevation={3}
          sx={{
            maxWidth: "800px",
            margin: "0 auto",
            padding: (theme) => theme.spacing(3, 2),
          }}
        >
          <Typography variant="h5" sx={{ marginBottom: 2 }}>
            Inventory Status
          </Typography>
          <Table sx={{ minWidth: "650px" }}>
            <TableHead>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell>Picture</TableCell>
                <TableCell align="right">Quantity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventory.map((item) => (
                <TableRow hover key={item.productId}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>
                    {item.productPicture ? (
                      <Card sx={{ maxWidth: 100 }}>
                        <CardMedia
                          sx={{ height: 80 }}
                          image={item.productPicture}
                          title={item.productName}
                        />
                      </Card>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        이미지 없음
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {inventory.length === 0 && (
            <Typography 
              variant="body1" 
              sx={{ 
                textAlign: 'center', 
                padding: 4,
                color: 'text.secondary' 
              }}
            >
              No inventory items found.
            </Typography>
          )}
        </Paper>
      )}
    </Box>
  );
}