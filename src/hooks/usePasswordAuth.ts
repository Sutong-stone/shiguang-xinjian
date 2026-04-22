import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "site_password";
const CORRECT_PASSWORD = "baby2024";

export function usePasswordAuth() {
  const [isVerified, setIsVerified] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [error, setError] = useState("");

  // Check localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === CORRECT_PASSWORD) {
      setIsVerified(true);
    }
  }, []);

  const verify = useCallback((pwd: string) => {
    if (pwd === CORRECT_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, pwd);
      setIsVerified(true);
      setShowDialog(false);
      setError("");
    } else {
      setError("密码不正确");
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setIsVerified(false);
    setError("");
    window.location.reload();
  }, []);

  return {
    isVerified,
    showDialog,
    setShowDialog,
    error,
    verify,
    logout,
    isLoading: false,
  };
}
