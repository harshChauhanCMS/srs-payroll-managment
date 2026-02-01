"use client";

import { Button } from "antd";
import { useRouter } from "next/navigation";

const Title = ({
  title,
  buttonText,
  destination,
  onButtonClick,
  showButton = true,
}) => {
  const router = useRouter();

  const handleDestination = () => {
    if (onButtonClick) {
      onButtonClick();
    } else if (destination) {
      router.push(destination);
    }
  };

  return (
    <div className="flex justify-between">
      <h1 className="text-[#2E2E2E] text-xl" style={{ fontWeight: 600 }}>
        {title}
      </h1>

      {showButton && buttonText && (
        <Button
          className="simple-button"
          onClick={handleDestination}
          style={{ borderRadius: "8px" }}
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
};

export default Title;
