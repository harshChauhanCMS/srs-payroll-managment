"use client";

import toast from "react-hot-toast";
import usePostQuery from "@/hooks/postQuery.hook";

import { apiUrls } from "@/apis";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { Fragment } from "react";
import { setUser } from "@/helpers/slices/userSlice";
import { setAuthTokens, setUserData } from "@/utils/storage";
import { Form, Input, Button, Typography } from "antd";
import { LockOutlined, PhoneOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const { postQuery, loading } = usePostQuery();
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogin = (values) => {
    // Add +91 prefix to mobile number
    const mobileNumberWithPrefix = `+91${values.mobileNumber}`;

    const payload = {
      mobileNumber: mobileNumberWithPrefix,
      password: values.password,
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
          })
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
    <Fragment>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f7fa",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: 400,
            padding: 32,
            borderRadius: 16,
            backgroundColor: "#fff",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          <Title
            level={3}
            style={{
              textAlign: "center",
              color: "#1E3A5F",
              marginBottom: 24,
            }}
          >
            Admin Login
          </Title>

          <Form form={form} layout="vertical" onFinish={handleLogin}>
            <Form.Item
              label="Mobile Number"
              name="mobileNumber"
              rules={[
                { required: true, message: "Please enter your mobile number" },
                {
                  pattern: /^[6-9]\d{9}$/,
                  message: "Please enter a valid 10-digit mobile number",
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                size="large"
                placeholder="9699554545"
                maxLength={10}
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please enter your password" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                size="large"
                placeholder="Enter your password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                block
                className="simple-button"
                style={{
                  borderRadius: 20,
                }}
              >
                Log In
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </Fragment>
  );
};

export default Login;
