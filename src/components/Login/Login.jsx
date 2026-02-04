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
import { Form, Input, Button, Typography, Checkbox } from "antd";

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
      <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-[#F39035] to-[#FBA810] p-4 sm:p-6 md:p-10">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* LEFT CONTENT - Hidden on mobile */}
          <div className="hidden md:block text-white pr-0 md:pr-12">
            <Title
              level={1}
              style={{ color: "#fff", marginBottom: 24, fontWeight: 700 }}
            >
              Welcome to SRS Manpower Portal
            </Title>

            <Text
              style={{
                color: "#fff",
                fontSize: "1.125rem",
                display: "block",
                marginBottom: 32,
                opacity: 0.9,
              }}
            >
              Experience seamless access to your workspace. Manage company
              payslip, attendance, collaborate with teams, and achieve more with
              our powerful platform.
            </Text>

            <ul className="list-none space-y-6">
              <li className="flex flex-col">
                <span className="font-bold text-lg mb-1">
                  Secure & Reliable
                </span>
                <span className="opacity-80">
                  Enterprise-grade security to protect your data
                </span>
              </li>
              <li className="flex flex-col">
                <span className="font-bold text-lg mb-1">Lightning Fast</span>
                <span className="opacity-80">
                  Optimized performance for instant access
                </span>
              </li>
              <li className="flex flex-col">
                <span className="font-bold text-lg mb-1">
                  Team Collaboration
                </span>
                <span className="opacity-80">
                  Work together seamlessly in real-time
                </span>
              </li>
            </ul>
          </div>

          {/* RIGHT LOGIN CARD */}
          <div className="w-full max-w-[420px] mx-auto bg-white rounded-2xl p-6 sm:p-8 md:p-10 shadow-xl">
            <div className="flex justify-center mb-6">
              <Image
                src={images.srsLogo}
                alt="SRS Logo"
                width={90}
                height={60}
                style={{ objectFit: "contain" }}
              />
            </div>

            <Title level={4} style={{ textAlign: "center", marginBottom: 8 }}>
              Sign in to the portal
            </Title>
            <Text
              style={{
                display: "block",
                textAlign: "center",
                color: "#9ca3af",
                marginBottom: 32,
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
                  prefix={<MailOutlined style={{ color: "#9ca3af" }} />}
                  placeholder="Enter email ID"
                  style={{ borderRadius: 8 }}
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
                  prefix={<LockOutlined style={{ color: "#9ca3af" }} />}
                  placeholder="Enter password"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Button
                htmlType="submit"
                size="large"
                loading={loading}
                className="simple-button"
                block
                style={{
                  borderRadius: "8px",
                }}
              >
                Login
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Login;
