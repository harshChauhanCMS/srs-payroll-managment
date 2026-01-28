"use client";

import { useRouter } from "next/navigation";
import { Box, Typography } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

export default function BackHeader({ label, href, rightContent }) {
  const router = useRouter();

  const handleBack = () => {
    if (href) {
      router.push(href);
      return;
    }
    router.back();
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 3,
      }}
    >
      <Box
        onClick={handleBack}
        role="button"
        tabIndex={0}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: "#121212",
          cursor: "pointer",
          transition: "color 0.3s",
          "&:hover": {
            color: "#366598",
          },
        }}
      >
        <ArrowBack />
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
      </Box>
      <Box>{rightContent}</Box>
    </Box>
  );
}
