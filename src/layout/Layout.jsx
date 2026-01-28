import useOnline from "@/hooks/useOnline";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/Sidebar/Sidebar";

import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Box, Fab, Typography, Card } from "@mui/material";
import {
  Close,
  KeyboardDoubleArrowRight,
  SignalWifiOff,
  Warning,
} from "@mui/icons-material";

const Layout = () => {
  const isOnline = useOnline();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    let mounted = true;

    if (!token && mounted) {
      navigate("/", { replace: true });
    }

    return () => {
      mounted = false;
    };
  }, [token, navigate]);

  // Early return if no token or still loading
  if (!token) {
    return null;
  }

  return (
    <>
      {isOnline ? (
        <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
          <Sidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              overflow: "auto",
              ml: { lg: isCollapsed ? "80px" : "256px", xs: 0 },
              transition: "margin-left 0.3s",
            }}
          >
            <Header />
            <Box
              sx={{
                px: 3,
                py: 2,
                flex: 1,
                overflow: "auto",
                position: "relative",
              }}
            >
              <Outlet />
              {sidebarOpen ? (
                <Fab
                  color="primary"
                  onClick={() => setSidebarOpen(false)}
                  sx={{
                    display: { xs: "flex", lg: "none" },
                    position: "fixed",
                    bottom: 16,
                    left: 270,
                    zIndex: 1000,
                  }}
                >
                  <Close />
                </Fab>
              ) : (
                <Fab
                  color="primary"
                  onClick={() => setSidebarOpen(true)}
                  sx={{
                    display: { xs: "flex", lg: "none" },
                    position: "fixed",
                    bottom: 16,
                    left: 16,
                    zIndex: 1000,
                  }}
                >
                  <KeyboardDoubleArrowRight />
                </Fab>
              )}
            </Box>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            background: "linear-gradient(to bottom, #f4f4f4, #e0e0e0)",
          }}
        >
          <Card
            sx={{
              textAlign: "center",
              p: 4,
              backgroundColor: "white",
              borderRadius: 2,
              boxShadow: 3,
              border: "1px solid #e0e0e0",
              maxWidth: 400,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <SignalWifiOff sx={{ fontSize: 40, color: "error.main" }} />
            </Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{ color: "#5c536e", mb: 1, fontWeight: 600 }}
            >
              You’re Offline!
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#7a6f8c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <Warning sx={{ color: "warning.main" }} />
              Please check your internet connection
            </Typography>
          </Card>
        </Box>
      )}
    </>
  );
};

export default Layout;
