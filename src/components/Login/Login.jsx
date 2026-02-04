"use client";

import Image from "next/image";
import toast from "react-hot-toast";
import usePostQuery from "@/hooks/postQuery.hook";

import { Fragment } from "react";
import { apiUrls } from "@/apis";
import { images } from "@/assets/images";
import { ROLES } from "@/constants/roles";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setUser } from "@/helpers/slices/userSlice";
import { setAuthTokens, setUserData } from "@/utils/storage";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Form, Input, Button, Typography, Checkbox, Row, Col } from "antd";

const { Title, Text } = Typography;

const DASHBOARD_BY_ROLE = {
  [ROLES.ADMIN]: "/admin/dashboard",
  [ROLES.HR]: "/hr/dashboard",
  [ROLES.EMPLOYEE]: "/employee/dashboard",
};

const getDashboardPath = (role) => DASHBOARD_BY_ROLE[role] || "/";

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
          background: "linear-gradient(135deg, #F39035, #FBA810)",
          padding: "40px",
        }}
      >
        <Row style={{ minHeight: "100%" }} align="middle" justify="center">
          {/* LEFT CONTENT */}
          <Col
            xs={0}
            md={12}
            style={{
              color: "#fff",
              paddingRight: 48,
            }}
          >
            <Title level={2} style={{ color: "#fff" }}>
              Welcome to SRS Manpower Portal
            </Title>

            <Text style={{ color: "#fff", fontSize: 16 }}>
              Experience seamless access to your workspace. Manage company
              payslip, attendance, collaborate with teams, and achieve more with
              our powerful platform.
            </Text>

            <div style={{ marginTop: 32 }}>
              <ul
                style={{
                  listStyle: "disc",
                  paddingLeft: 20,
                  fontSize: 16,
                }}
              >
                <li style={{ marginBottom: 16 }}>
                  <strong>Secure & Reliable</strong>
                  <br />
                  Enterprise-grade security to protect your data
                </li>
                <li style={{ marginBottom: 16 }}>
                  <strong>Lightning Fast</strong>
                  <br />
                  Optimized performance for instant access
                </li>
                <li>
                  <strong>Team Collaboration</strong>
                  <br />
                  Work together seamlessly in real-time
                </li>
              </ul>
            </div>
          </Col>

          {/* RIGHT LOGIN CARD */}
          <Col xs={24} md={10}>
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: "40px 32px",
                maxWidth: 420,
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 24,
                }}
              >
                <Image
                  src={images.srsLogo}
                  alt="SRS Logo"
                  width={90}
                  height={60}
                  style={{ objectFit: "contain" }}
                />
              </div>

              <Title level={4} style={{ textAlign: "center" }}>
                Sign in to the portal
              </Title>
              <Text
                style={{
                  display: "block",
                  textAlign: "center",
                  marginBottom: 24,
                  color: "#8c8c8c",
                }}
              >
                Enter Credentials to continue
              </Text>

              <Form form={form} layout="vertical" onFinish={handleLogin}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Please enter your email" },
                    { type: "email", message: "Invalid email format" },
                  ]}
                >
                  <Input
                    size="large"
                    prefix={<MailOutlined />}
                    placeholder="Enter email ID"
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
                    size="large"
                    prefix={<LockOutlined />}
                    placeholder="Enter password"
                  />
                </Form.Item>

                <Row
                  align="middle"
                  justify="space-between"
                  style={{ marginBottom: 24 }}
                >
                  <Checkbox>Remember Me</Checkbox>
                  <Text
                    style={{
                      color: "#F39035",
                      cursor: "pointer",
                      fontWeight: 500,
                    }}
                  >
                    Forgot Password?
                  </Text>
                </Row>

                <Button
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  block
                  style={{
                    background: "#E89A4F",
                    color: "#fff",
                    borderRadius: 8,
                    border: "none",
                    height: 48,
                    fontWeight: 600,
                  }}
                >
                  Login
                </Button>
              </Form>
            </div>
          </Col>
        </Row>
      </div>
    </Fragment>
  );
};

export default Login;
