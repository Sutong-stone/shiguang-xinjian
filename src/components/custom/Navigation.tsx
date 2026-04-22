import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { usePasswordAuth } from "@/hooks/usePasswordAuth";
import { Menu, X, Heart, Lock, Unlock, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import PasswordGate from "./PasswordGate";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {
    isVerified,
    showDialog,
    setShowDialog,
    error,
    verify,
    logout,
    isLoading,
  } = usePasswordAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { path: "/", label: "首页" },
    { path: "/album", label: "相册" },
    { path: "/timeline", label: "成长记录" },
    { path: "/messages", label: "父母寄语" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-xl shadow-soft"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <Heart
                className={`w-5 h-5 transition-colors duration-300 ${
                  isScrolled ? "text-[#D4A78C]" : "text-[#D4A78C]"
                } group-hover:text-[#E8B8A0]`}
                fill="currentColor"
              />
              <span
                className={`text-lg font-medium transition-colors duration-300 ${
                  isScrolled ? "text-[#8C7B72]" : "text-[#8C7B72]"
                }`}
              >
                拾光信笺
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                    isActive(link.path)
                      ? "bg-[#FDECE4] text-[#8C7B72]"
                      : "text-[#8C7B72]/70 hover:text-[#8C7B72] hover:bg-[#FDECE4]/50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Password Auth Section */}
            <div className="hidden md:flex items-center gap-2">
              {isVerified ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FDECE4]/60">
                    <Unlock className="w-3.5 h-3.5 text-[#D4A78C]" />
                    <span className="text-xs text-[#8C7B72]">已解锁</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-[#8C7B72]/60 hover:text-[#8C7B72] hover:bg-[#FDECE4]/50 h-8 px-2"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDialog(true)}
                  className="text-[#8C7B72] hover:bg-[#FDECE4]/50 hover:text-[#D4A78C] rounded-full"
                >
                  <Lock className="w-3.5 h-3.5 mr-1.5" />
                  输入密码
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg text-[#8C7B72]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-[#FDECE4]">
            <div className="px-6 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm transition-all ${
                    isActive(link.path)
                      ? "bg-[#FDECE4] text-[#8C7B72]"
                      : "text-[#8C7B72]/70 hover:bg-[#FDECE4]/50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-[#FDECE4]">
                {isVerified ? (
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Unlock className="w-4 h-4 text-[#D4A78C]" />
                      <span className="text-sm text-[#8C7B72]">已解锁</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-[#8C7B72]/60"
                    >
                      退出
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setShowDialog(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm text-[#D4A78C] hover:bg-[#FDECE4]/50"
                  >
                    <Lock className="w-4 h-4" />
                    输入密码解锁
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Password Dialog */}
      <PasswordGate
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onVerify={verify}
        error={error}
        isLoading={isLoading}
      />
    </>
  );
}
