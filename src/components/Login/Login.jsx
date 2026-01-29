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
import { LockOutlined, MailOutlined } from "@ant-design/icons";

const { Title } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const { postQuery, loading } = usePostQuery();
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogin = (values) => {
    const payload = {
      email: values.email.trim().toLowerCase(),
      password: values.password,
    };

    postQuery({
      url: apiUrls.auth.login,
      postData: payload,
      headers: {
        "Content-Type": "application/json",
      },
      onSuccess: (res) => {
        const { token, user } = res;

        dispatch(
          setUser({
            user,
            tokens: { accessToken: token },
          }),
        );

        setAuthTokens({ accessToken: token });
        setUserData(user);

        toast.success(res.message || "Login successful");
        router.push("/admin/dashboard");
      },
      onFail: () => {
        // Error toast handled by postQuery hook
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
            SRS Payroll Login
          </Title>

          <Form form={form} layout="vertical" onFinish={handleLogin}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                size="large"
                placeholder="you@company.com"
                type="email"
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
