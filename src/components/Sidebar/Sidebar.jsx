"use client";

import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";

import { useAuth } from "@/hooks/useAuth";
import { clearAuthData } from "@/utils/storage";

import { images } from "@/assets/images";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSidebarItems, sidebarHeading } from "@/constants/sidebarItems";
import {
  Logout,
  ArrowBack,
  ArrowForward,
  ExpandLess,
  ExpandMore,
  MenuOpen,
} from "@mui/icons-material";
import {
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  isCollapsed,
  setIsCollapsed,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const theme = useTheme();
  // We use this to detect mobile screens
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  // Get sidebar items based on user role
  const sidebarNavItems = getSidebarItems(user?.role || "customer");

  // Get dashboard link based on user role
  const getDashboardLink = () => {
    switch (user?.role) {
      case "admin":
        return "/admin/dashboard";
      case "vendor":
        return "/vendor/dashboard";
      case "customer":
      default:
        return "/user/dashboard";
    }
  };

  const isActive = (item) => {
    const childRoutes = (item.children || []).map((c) => c.link);
    const routesToMatch = [
      item.link,
      ...(item.matchRoutes || []),
      ...childRoutes,
    ].filter(Boolean);
    return routesToMatch.some((route) => pathname.startsWith(route));
  };

  const [openMenus, setOpenMenus] = useState(() => {
    const initialOpen = {};
    sidebarNavItems.forEach((item) => {
      if (
        item.children &&
        item.children.some((c) => pathname.startsWith(c.link))
      ) {
        initialOpen[item.name] = true;
      }
    });
    return initialOpen;
  });

  const openMenusRef = useRef(openMenus);
  useEffect(() => {
    openMenusRef.current = openMenus;
  }, [openMenus]);

  const toggleMenu = (name) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleLogout = () => {
    logout();
    clearAuthData();
    toast.success("Logged out successfully");
    router.push("/");
  };

  useEffect(() => {
    // Auto-open any parent with an active child
    const itemsToOpen = {};
    let foundActive = false;

    sidebarNavItems.forEach((item) => {
      if (
        item.children &&
        item.children.some((c) => pathname.startsWith(c.link))
      ) {
        itemsToOpen[item.name] = true;
        foundActive = true;
      }
    });

    if (foundActive) {
      const currentOpen = openMenusRef.current;
      const needsUpdate = Object.keys(itemsToOpen).some(
        (key) => !currentOpen[key],
      );

      if (needsUpdate) {
        // eslint-disable-next-line
        setOpenMenus((prev) => ({ ...prev, ...itemsToOpen }));
      }
    }
  }, [pathname, sidebarNavItems]);

  const sidebarContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "#1E3A5F",
        color: "white",
        overflow: "hidden",
      }}
    >
      {/* Header / Logo Area */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          position: "relative",
        }}
      >
        {!isMobile && (
          <IconButton
            onClick={() => setIsCollapsed(!isCollapsed)}
            sx={{
              position: "absolute",
              top: 20,
              right: -12,
              width: 24,
              height: 24,
              bgcolor: "white",
              color: "#C2A368",
              boxShadow: 2,
              "&:hover": { bgcolor: "#f5f5f5" },
              zIndex: 1200,
            }}
            size="small"
          >
            {isCollapsed ? (
              <ArrowForward fontSize="small" />
            ) : (
              <ArrowBack fontSize="small" />
            )}
          </IconButton>
        )}

        {/* <Image
          src={images.vakeelLogo}
          alt="Vakeel At Home"
          width={isCollapsed ? 60 : 120}
          height={isCollapsed ? 60 : 120}
          onClick={() => router.push(getDashboardLink())}
          style={{ cursor: "pointer", transition: "all 0.3s" }}
        /> */}
        {!isCollapsed && (
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "#C2A368", cursor: "pointer" }}
            onClick={() => router.push(getDashboardLink())}
          >
            {sidebarHeading}
          </Typography>
        )}
      </Box>

      {/* Navigation Items */}
      <List
        component="nav"
        sx={{
          flex: 1,
          px: 1,
          overflowY: "auto",
          overflowX: "hidden",
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: 2,
          },
        }}
      >
        {sidebarNavItems.map((item) => {
          const hasChildren =
            Array.isArray(item.children) && item.children.length > 0;
          const active = isActive(item);
          const isOpen = openMenus[item.name];
          const itemIcon = <item.icon />;

          if (!hasChildren) {
            return (
              <Tooltip
                key={item.name}
                title={isCollapsed ? item.name : ""}
                placement="right"
                arrow
              >
                <ListItem disablePadding sx={{ display: "block", mb: 0.5 }}>
                  <Link href={item.link} passHref legacyBehavior>
                    <ListItemButton
                      selected={active}
                      onClick={() => {
                        if (isMobile) setSidebarOpen(false);
                      }}
                      sx={{
                        minHeight: 48,
                        justifyContent: isCollapsed ? "center" : "initial",
                        px: 2.5,
                        borderRadius: 1,
                        "&.Mui-selected": {
                          bgcolor: "rgba(148, 163, 184, 0.4)", // bg-slate-400 equivalent opacity
                          "&:hover": {
                            bgcolor: "rgba(148, 163, 184, 0.5)",
                          },
                        },
                        "&:hover": {
                          bgcolor: "rgba(255, 255, 255, 0.08)",
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: isCollapsed ? 0 : 2,
                          justifyContent: "center",
                          color: active ? "white" : "rgba(255, 255, 255, 0.7)",
                        }}
                      >
                        {itemIcon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.name}
                        sx={{
                          opacity: isCollapsed ? 0 : 1,
                          ".MuiTypography-root": {
                            color: "white",
                            fontWeight: active ? 600 : 400,
                          },
                        }}
                      />
                    </ListItemButton>
                  </Link>
                </ListItem>
              </Tooltip>
            );
          }

          // Parent with children
          return (
            <Box key={item.name} sx={{ display: "block", mb: 0.5 }}>
              <Tooltip
                title={isCollapsed ? item.name : ""}
                placement="right"
                arrow
              >
                <ListItemButton
                  selected={active}
                  onClick={() => {
                    if (isCollapsed) {
                      router.push(item.link);
                      if (isMobile) setSidebarOpen(false);
                      return;
                    }
                    toggleMenu(item.name);
                  }}
                  sx={{
                    minHeight: 48,
                    justifyContent: isCollapsed ? "center" : "initial",
                    px: 2.5,
                    borderRadius: 1,
                    "&.Mui-selected": {
                      bgcolor: "rgba(148, 163, 184, 0.4)",
                    },
                    "&:hover": {
                      bgcolor: "rgba(255, 255, 255, 0.08)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: isCollapsed ? 0 : 2,
                      justifyContent: "center",
                      color: active ? "white" : "rgba(255, 255, 255, 0.7)",
                    }}
                  >
                    {itemIcon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.name}
                    sx={{
                      opacity: isCollapsed ? 0 : 1,
                      ".MuiTypography-root": { color: "white" },
                    }}
                  />
                  {!isCollapsed &&
                    (isOpen ? (
                      <ExpandLess sx={{ color: "white" }} />
                    ) : (
                      <ExpandMore sx={{ color: "white" }} />
                    ))}
                </ListItemButton>
              </Tooltip>

              <Collapse
                in={isOpen && !isCollapsed}
                timeout="auto"
                unmountOnExit
              >
                <List component="div" disablePadding>
                  {item.children.map((child) => {
                    const childActive = pathname.startsWith(child.link);
                    return (
                      <ListItemButton
                        key={child.name}
                        sx={{
                          pl: 4,
                          py: 0.5,
                          borderRadius: 1,
                          "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)" },
                        }}
                        onClick={() => {
                          router.push(child.link);
                          if (isMobile) setSidebarOpen(false);
                        }}
                      >
                        <ListItemText
                          primary={`• ${child.name}`}
                          sx={{
                            ".MuiTypography-root": {
                              fontSize: "0.875rem",
                              color: childActive
                                ? "white"
                                : "rgba(255, 255, 255, 0.7)",
                              fontWeight: childActive ? 600 : 400,
                            },
                          }}
                        />
                      </ListItemButton>
                    );
                  })}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </List>

      {/* Footer / Logout */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)", mb: 2 }} />
        <ListItemButton
          onClick={handleLogout}
          sx={{
            justifyContent: isCollapsed ? "center" : "flex-start",
            borderRadius: 1,
            color: "white",
            "&:hover": {
              bgcolor: "transparent",
              color: "#ff8a80", // Light red hover
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: isCollapsed ? 0 : 2,
              justifyContent: "center",
              color: "inherit",
            }}
          >
            <Logout />
          </ListItemIcon>
          <ListItemText
            primary="Log Out"
            sx={{
              opacity: isCollapsed ? 0 : 1,
              whiteSpace: "nowrap",
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { lg: isCollapsed ? 80 : 256 },
        flexShrink: { lg: 0 },
        transition: "width 0.3s",
      }}
      aria-label="mailbox folders"
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 256,
            border: "none",
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Desktop Persistent Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", lg: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: isCollapsed ? 80 : 256,
            transition: "width 0.3s",
            border: "none",
            overflow: "visible", // For the collapse button
          },
        }}
        open
      >
        {sidebarContent}
      </Drawer>
    </Box>
  );
}
