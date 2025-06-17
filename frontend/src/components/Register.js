import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Box,
} from "@mui/material";
import { MedicalServices } from "@mui/icons-material";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    const newUser = {
      username,
      password,
      fullname,
      role: "user",
    };

    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUser),
        }
      );

      if (response.ok) {
        alert("Registration successful! Please login.");
        navigate("/login");
      } else {
        alert("Registration failed! Username may already exist.");
      }
    } catch (error) {
      alert("An error occurred during registration.");
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
            Register
          </Typography>
          <form onSubmit={handleRegister}>
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
            <TextField
              label="Full Name"
              fullWidth
              margin="normal"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
            />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
              Register
            </Button>
          </form>
          <Typography align="center" sx={{ mt: 2 }}>
            Already have an account? <a href="/login">Login</a>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

export default Register;
