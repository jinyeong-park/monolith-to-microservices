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
import React from "react";
import {
  Drawer,
  AppBar,
  CssBaseline,
  Toolbar,
  List,
  Typography,
  ListItem,
  ListItemText,
  Box,
} from "@mui/material";

import {
  BrowserRouter as Router,
  Route,
  Switch,
  NavLink,
} from "react-router-dom";

//Import Pages
import Home from "../../pages/Home";
import Products from "../../pages/Products";
import Orders from "../../pages/Orders";
import OrderDetails from "../../pages/OrderDetails";
import Inventory from "../../pages/Inventory";
import NotFound from "../../pages/NotFound";
import PopularProducts from "../../pages/PopularProducts";

const drawerWidth = 200;

export default function ClippedDrawer() {
  return (
    <Box sx={{ display: "flex" }}>
      <Router>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: "#667eea"  // 배경색 추가
          }}
        >
          <Toolbar>
            <img 
              src="https://storage.cloud.google.com/fancystore-products/fancy_store_logo.png" 
              alt="Fancy Store Logo"
              style={{ 
                width: "35px", 
                height: "35px", 
                marginRight: "15px",
                verticalAlign: "middle"
              }}
            />
            <Typography 
              variant="h6" 
              noWrap 
              sx={{ 
                display: "inline-flex",
                alignItems: "center"
              }}
            >
              Fancy Store
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          <Toolbar />
          <List>
            <ListItem
              component={NavLink}
              exact
              sx={{ color: "rgba(0, 0, 0, 0.54)" }}
              activeClassName="Mui-selected"
              to="/"
            >
              <ListItemText primary="Home" />
            </ListItem>{" "}
            <ListItem
              component={NavLink}
              exact
              sx={{ color: "rgba(0, 0, 0, 0.54)" }}
              activeClassName="Mui-selected"
              to="/products"
            >
              <ListItemText primary="Products" />
            </ListItem>{" "}
            <ListItem
              component={NavLink}
              sx={{ color: "rgba(0, 0, 0, 0.54)" }}
              activeClassName="Mui-selected"
              to="/orders"
            >
              <ListItemText primary="Orders" />
            </ListItem>
            <ListItem
              component={NavLink}
              sx={{ color: "rgba(0, 0, 0, 0.54)" }}
              activeClassName="Mui-selected"
              to="/inventory"
            >
              <ListItemText primary="Inventory" />
            </ListItem>
            <ListItem
              component={NavLink}
              exact
              sx={{ color: "rgba(0, 0, 0, 0.54)" }}
              activeClassName="Mui-selected"
              to="/popular-products"
            >
              <ListItemText primary="Popular Products" />
            </ListItem>
          </List>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route exact path="/products">
              <Products />
            </Route>
            <Route path="/orders/:id">
              <OrderDetails />
            </Route>
            <Route path="/orders">
              <Orders />
            </Route>
            <Route path="/inventory">
              <Inventory />
            </Route>
            <Route path="/popular-products">
              <PopularProducts />
            </Route>
            <Route>
              <NotFound />
            </Route>
          </Switch>
        </Box>
      </Router>
    </Box>
  );
}
