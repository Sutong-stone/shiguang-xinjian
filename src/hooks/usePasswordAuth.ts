import { useState, useCallback, useEffect } from "react";
import { trpc } from "@/providers/trpc";

const STORAGE_KEY = "site_password";

export function usePasswordAuth() {
  const [isVerified, setIsVerified] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const verifyMutation = trpc.password.verify.useMutation({
    onSuccess: () => {
      localStorage.setItem(STORAGE_KEY, password);
      setIsVerified(true);
      setShowDialog(false);
      setError("");
    },
    onError: (err) => {
      setError(err.message || "密码不正确");
    },
  });

  // Check localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setPassword(stored);
      setIsVerified(true);
    }
  }, []);

  const verify = useCallback(
    (pwd: string) => {
      setPassword(pwd);
      verifyMutation.mutate({ password: pwd });
    },
    [verifyMutation]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setIsVerified(false);
    setPassword("");
    setError("");
    window.location.reload();
  }, []);

  return {
    isVerified,
    showDialog,
    setShowDialog,
    password,
    setPassword,
    error,
    verify,
    logout,
    isLoading: verifyMutation.isPending,
  };
}
