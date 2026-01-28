"use client";

import toast from "react-hot-toast";
import usePostQuery from "@/hooks/postQuery.hook";

import { apiUrls } from "@/apis";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setUser } from "@/helpers/slices/userSlice";
import { setAuthTokens, setUserData } from "@/utils/storage";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  InputAdornment,
} from "@mui/material";
import { Phone, Lock } from "@mui/icons-material";

const Login = () => {
  const { postQuery, loading } = usePostQuery();
  const dispatch = useDispatch();
  const router = useRouter();

  // Local state for form values
  const [formData, setFormData] = useState({
    mobileNumber: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    mobileNumber: "",
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

    if (!formData.mobileNumber) {
      newErrors.mobileNumber = "Please enter your mobile number";
      isValid = false;
    } else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Please enter a valid 10-digit mobile number";
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

    // Add +91 prefix to mobile number
    const mobileNumberWithPrefix = `+91${formData.mobileNumber}`;

    const payload = {
      mobileNumber: mobileNumberWithPrefix,
      password: formData.password,
      role: "admin",
    };

    postQuery({
      url: apiUrls.auth.login,
      postData: payload,
      headers: {
        "Content-Type": "application/json",
      },
      onSuccess: (res) => {
        const { token, admin } = res;

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
              id="mobileNumber"
              label="Mobile Number"
              name="mobileNumber"
              placeholder="9699554545"
              autoFocus
              value={formData.mobileNumber}
              onChange={handleChange}
              error={!!errors.mobileNumber}
              helperText={errors.mobileNumber}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone color="action" />
                    </InputAdornment>
                  ),
                },
              }}
              inputProps={{ maxLength: 10 }}
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
