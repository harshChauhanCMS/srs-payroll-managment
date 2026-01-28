"use client";
import { createTheme } from "@mui/material/styles";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const theme = createTheme({
  typography: {
    fontFamily: poppins.style.fontFamily,
  },
  palette: {
    primary: {
      main: "#1e3a5f",
      contrastText: "#ffffff",
    },
    error: {
      main: "#fb2c36",
    },
    background: {
      default: "#ffffff",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "2px",
          gap: "8px",
          transition: "all 0.3s ease",
          padding: "4px 15px",
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
      variants: [
        {
          props: { variant: "white" },
          style: {
            backgroundColor: "#ffffff",
            color: "#1e3a5f",
            border: "1px solid #1e3a5f",
            "&:hover": {
              backgroundColor: "#1e3a5f",
              color: "#ffffff",
            },
          },
        },
      ],
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: "#1e3a5f",
          color: "#ffffff",
          textAlign: "center",
          fontWeight: 600,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#1e3a5f",
          "& .MuiTableCell-root": {
            color: "#ffffff",
          },
        },
      },
    },
  },
});

export default theme;
