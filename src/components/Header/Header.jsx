"use client";

import { images } from "@/assets/images";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Box, Typography, Button, Avatar } from "@mui/material";

const Header = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const handleLoginClick = () => router.push("/");

  return (
    <Box
      sx={{
        width: "100%",
        mx: "auto",
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        alignItems: { xs: "flex-start", lg: "center" },
        justifyContent: "space-between",
        gap: { xs: 1.5, lg: 3 },
      }}
    >
      {/* Greeting */}
      <Typography
        variant="h6"
        component="h1"
        sx={{
          color: "#C2A368",
          fontWeight: 600,
          lineHeight: 1.3,
          fontSize: { xs: "1rem", sm: "1.125rem", lg: "1.25rem" },
        }}
      >
        Hi, {user?.fullName || "User"}
      </Typography>

      {/* Actions */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: { xs: 1.5, sm: 2 },
        }}
      >
        {isAuthenticated ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
            }}
          >
            <Avatar
              src={user?.profile || images.profile}
              alt="Profile"
              sx={{
                width: 32,
                height: 32,
                border: "2px solid #f1f5f9",
                bgcolor: "#e2e8f0",
              }}
            />
            <Typography
              sx={{
                fontWeight: 500,
                fontSize: { xs: "0.875rem", sm: "1rem" },
                color: "#1e293b",
              }}
            >
              {user?.fullName || "User"}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Button
              variant="contained"
              onClick={handleLoginClick}
              size="small"
              sx={{
                textTransform: "none",
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.5, sm: 1 },
              }}
            >
              Login
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Header;
