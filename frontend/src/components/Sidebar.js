import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  MedicalServices,
  LocalShipping,
  Group,
  Receipt,
  Logout,
  People,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const drawerWidth = 240;

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, logout } = useAuth();

  const menuItems = [
    { text: "Overview", icon: <DashboardIcon />, path: "/dashboard" },
    {
      text: "Products",
      icon: <MedicalServices />,
      path: "/dashboard/products",
    },
    {
      text: "Distributors",
      icon: <LocalShipping />,
      path: "/dashboard/distributors",
    },
    { text: "Sales Teams", icon: <Group />, path: "/dashboard/teams" },
    { text: "Orders", icon: <Receipt />, path: "/dashboard/orders" },
    { text: "User Management", icon: <People />, path: "/dashboard/users" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          bgcolor: "#f5f5f5",
        },
      }}
    >
      <Typography
        variant="h6"
        sx={{ p: 2, color: "primary.main", fontWeight: 600 }}
      >
        Pharmacy Distribution
      </Typography>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
            sx={{
              cursor: "pointer",
              "&.Mui-selected": {
                backgroundColor: "primary.light",
                color: "primary.main",
                "& .MuiListItemIcon-root": { color: "primary.main" },
              },
            }}
          >
            <ListItemIcon sx={{ color: "text.secondary" }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Drawer>
  );
}

export default Sidebar;
