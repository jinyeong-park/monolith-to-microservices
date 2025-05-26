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
import React, { useState, useEffect, useCallback } from "react";
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
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Temporarily added at the beginning of fetchInventory function
  console.log('Environment URL:', process.env.REACT_APP_INVENTORY_URL);

  const fetchInventory = useCallback(async () => {
    // Don't refetch if cache is valid
    if (lastFetchTime && (Date.now() - lastFetchTime < CACHE_DURATION)) {
      setLoading(false);
      return;
    }
    
    try {
      // const response = await fetch(`http://localhost:8080/service/inventory`);
      const inventoryUrl = `${process.env.REACT_APP_INVENTORY_URL}`;
      const response = await fetch(inventoryUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const inventoryData = await response.json();
      setInventory(inventoryData);
      setLastFetchTime(Date.now());
      setErrors(false); // Reset error state on success
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setErrors(true);
      setLoading(false);
    }
  }, [lastFetchTime, CACHE_DURATION]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

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
                        No image
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