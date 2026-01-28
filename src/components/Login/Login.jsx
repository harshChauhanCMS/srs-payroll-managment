"use client";

import toast from "react-hot-toast";
import usePostQuery from "@/hooks/postQuery.hook";

import { useState } from "react";
import { apiUrls } from "@/apis";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { Email, Lock } from "@mui/icons-material";
import { setUser } from "@/helpers/slices/userSlice";
import { setAuthTokens, setUserData } from "@/utils/storage";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  InputAdornment,
} from "@mui/material";

const Login = () => {
  const { postQuery, loading } = usePostQuery();
  const dispatch = useDispatch();
  const router = useRouter();

  // Local state for form values
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (!formData.email) {
      newErrors.email = "Please enter your email";
      isValid = false;
    } else if (
      !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)
    ) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Please enter your password";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (!validate()) return;

    const payload = {
      email: formData.email,
      password: formData.password,
    };

    postQuery({
      url: apiUrls.auth.login,
      postData: payload,
      headers: {
        "Content-Type": "application/json",
      },
      onSuccess: (res) => {
        const { token, admin } = res.data;

        dispatch(
          setUser({
            user: admin,
            tokens: { accessToken: token },
          }),
        );

        setAuthTokens({ accessToken: token });
        setUserData(admin);

        toast.success(res.message || "Login successful");

        router.push("/admin/dashboard");
      },
      onFail: (err) => {
        console.error("Login failed:", err);
        toast.error("Login failed. Please try again.");
      },
    });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f7fa",
        p: 3,
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: "100%",
          borderRadius: 4,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h5"
            component="h1"
            align="center"
            sx={{
              color: "#1E3A5F",
              fontWeight: 600,
              mb: 3,
            }}
          >
            Admin Login
          </Typography>
          <Box component="form" onSubmit={handleLogin} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              placeholder="admin@example.com"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                borderRadius: 20,
                py: 1.5,
                textTransform: "none",
                fontSize: "1rem",
              }}
            >
              {loading ? "Logging in..." : "Log In"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
