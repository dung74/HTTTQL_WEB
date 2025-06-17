import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Box,
} from "@mui/material";
import { MedicalServices } from "@mui/icons-material";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        const { token } = data;
        const user = data.data;
        login(user, token, user.role);
        navigate("/dashboard");
      } else {
        alert("Login failed! Incorrect username or password.");
      }
    } catch (error) {
      alert("An error occurred during login.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        bgcolor: "background.default",
        backgroundImage: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
      }}
    >
      <Container maxWidth="xs">
        <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
          <MedicalServices
            sx={{ fontSize: 50, color: "primary.main", mb: 2 }}
          />
          <Typography variant="h5" gutterBottom>
            Login
          </Typography>
          <form onSubmit={handleLogin}>
            <TextField
              label="Username"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
              Login
            </Button>
          </form>
          <Typography align="center" sx={{ mt: 2 }}>
            Don’t have an account? <a href="/register">Register</a>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login;
