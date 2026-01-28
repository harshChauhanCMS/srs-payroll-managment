"use client";

import { useRouter } from "next/navigation";
import { Box, Typography, Button } from "@mui/material";

const Title = ({ title, buttonText, destination, onButtonClick }) => {
  const router = useRouter();

  const handleDestination = () => {
    if (onButtonClick) {
      onButtonClick();
    } else if (destination) {
      router.push(destination);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
      }}
    >
      <Typography
        variant="h5"
        component="h1"
        sx={{
          color: "#2E2E2E",
          fontWeight: 600,
        }}
      >
        {title}
      </Typography>

      {buttonText && (
        <Button
          variant="contained"
          onClick={handleDestination}
          sx={{
            textTransform: "none",
            borderRadius: 20,
            px: 3,
          }}
        >
          {buttonText}
        </Button>
      )}
    </Box>
  );
};

export default Title;
