import { motion } from "framer-motion";
import { Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function Login() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "#FFF8F0" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-[#8C7B72]/60 hover:text-[#D4A78C] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-soft-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[#FDECE4] flex items-center justify-center mx-auto mb-5">
              <Heart
                className="w-8 h-8 text-[#D4A78C]"
                fill="currentColor"
              />
            </div>
            <h1
              className="text-2xl font-light mb-2"
              style={{ color: "#8C7B72" }}
            >
              欢迎回来
            </h1>
            <p className="text-sm text-[#8C7B72]/60">
              登录后可以撰写寄语，记录对宝宝的爱的留言
            </p>
          </div>

          {/* Login button */}
          <Button
            className="w-full bg-[#D4A78C] hover:bg-[#C49A7D] text-white rounded-full py-6 shadow-soft transition-all duration-300 text-base"
            size="lg"
            onClick={() => {
              window.location.href = getOAuthUrl();
            }}
          >
            使用 Kimi 账号登录
          </Button>

          {/* Note */}
          <p className="text-xs text-center text-[#8C7B72]/40 mt-6">
            登录后即表示您同意记录和分享对宝宝的爱
          </p>
        </div>

        {/* Decorative image */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-10 text-center"
        >
          <img
            src="/images/baby-shoes.jpg"
            alt="宝宝的小鞋子"
            className="w-32 h-32 object-cover rounded-full mx-auto shadow-soft opacity-70"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
