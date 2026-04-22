import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PasswordGateProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (password: string) => void;
  error: string;
  isLoading: boolean;
}

export default function PasswordGate({
  isOpen,
  onClose,
  onVerify,
  error,
  isLoading,
}: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onVerify(password.trim());
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-soft-lg relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full text-[#8C7B72]/40 hover:text-[#8C7B72] hover:bg-[#FDECE4]/50 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-[#FDECE4] flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-[#D4A78C]" />
              </div>
              <h3 className="text-lg font-medium text-[#8C7B72] mb-1">
                输入访问密码
              </h3>
              <p className="text-xs text-[#8C7B72]/50">
                输入密码后即可上传照片和撰写寄语
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="relative mb-4">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入访问密码"
                  className="pr-10 rounded-xl border-[#FDECE4] focus:border-[#D4A78C] focus:ring-[#D4A78C]/20 text-[#8C7B72] placeholder:text-[#8C7B72]/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7B72]/40 hover:text-[#8C7B72] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400 mb-4 text-center"
                >
                  {error}
                </motion.p>
              )}

              <Button
                type="submit"
                disabled={!password.trim() || isLoading}
                className="w-full bg-[#D4A78C] hover:bg-[#C49A7D] text-white rounded-full shadow-soft transition-all duration-300"
              >
                {isLoading ? "验证中..." : "确认"}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
