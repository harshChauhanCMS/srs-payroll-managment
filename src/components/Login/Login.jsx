"use client";

import toast from "react-hot-toast";
import usePostQuery from "@/hooks/postQuery.hook";

import { Fragment } from "react";
import { apiUrls } from "@/apis";
import { ROLES } from "@/constants/roles";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setUser } from "@/helpers/slices/userSlice";
import { Form, Input, Button, Typography } from "antd";
import { setAuthTokens, setUserData } from "@/utils/storage";
import { LockOutlined, MailOutlined } from "@ant-design/icons";

const { Title } = Typography;

const DASHBOARD_BY_ROLE = {
  [ROLES.SUPER_ADMIN]: "/admin/dashboard",
  [ROLES.HR]: "/hr/dashboard",
  [ROLES.ACCOUNTS]: "/accounts/dashboard",
  [ROLES.MANAGER]: "/manager/dashboard",
};

const getDashboardPath = (role) => DASHBOARD_BY_ROLE[role];

const Login = () => {
  const [form] = Form.useForm();
  const { postQuery, loading } = usePostQuery();
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogin = (values) => {
    postQuery({
      url: apiUrls.auth.login,
      postData: {
        email: values.email.trim().toLowerCase(),
        password: values.password,
      },
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
        router.push(getDashboardPath(user.role));
      },
      onFail: (err) => {
        toast.error(err.message || "Invalid credentials");
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
