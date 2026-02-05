import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const Loader = () => {
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-101">
      <Spin
        indicator={
          <LoadingOutlined
            style={{
              fontSize: 80,
              color: "#F39035",
            }}
            spin
            size="large"
          />
        }
      />
    </div>
  );
};

export default Loader;
