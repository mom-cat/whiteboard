import React, { useState } from "react";
import { Dialog } from "@excalidraw/excalidraw/components/Dialog";
import DialogActionButton from "@excalidraw/excalidraw/components/DialogActionButton";
import { TextField } from "@excalidraw/excalidraw/components/TextField";
import { Button } from "@excalidraw/excalidraw/components/Button";
import { t } from "@excalidraw/excalidraw/i18n";

import { authService } from "../../data/supabase";

import "./AuthDialog.scss";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthDialog: React.FC<AuthDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "signup") {
        await authService.signUp(email, password, displayName);
      } else {
        await authService.signIn(email, password);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setDisplayName("");
    setError("");
  };

  const switchMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    resetForm();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog
      onCloseRequest={onClose}
      title={mode === "signin" ? t("auth.signIn") : t("auth.signUp")}
      className="auth-dialog"
    >
      <div className="auth-dialog-content">
        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div className="auth-field">
              <TextField
                label={t("auth.displayName")}
                value={displayName}
                onChange={(value) => setDisplayName(value)}
                placeholder={t("auth.displayNamePlaceholder")}
              />
            </div>
          )}

          <div className="auth-field">
            <TextField
              label={t("auth.email")}
              value={email}
              onChange={(value) => setEmail(value)}
              placeholder={t("auth.emailPlaceholder")}
            />
          </div>

          <div className="auth-field">
            <TextField
              label={t("auth.password")}
              value={password}
              onChange={(value) => setPassword(value)}
              placeholder={t("auth.passwordPlaceholder")}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <div className="auth-actions">
            <DialogActionButton
              label={
                loading
                  ? t("auth.loading")
                  : mode === "signin"
                  ? t("auth.signIn")
                  : t("auth.signUp")
              }
              onClick={handleSubmit}
              disabled={loading}
            />

            <Button onSelect={switchMode} className="auth-switch-mode">
              {mode === "signin"
                ? t("auth.switchToSignUp")
                : t("auth.switchToSignIn")}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
};
