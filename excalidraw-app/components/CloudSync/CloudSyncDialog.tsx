import React, { useState, useEffect } from "react";
import { Dialog } from "@excalidraw/excalidraw/components/Dialog";
import DialogActionButton from "@excalidraw/excalidraw/components/DialogActionButton";
import { TextField } from "@excalidraw/excalidraw/components/TextField";
import { Button } from "@excalidraw/excalidraw/components/Button";
import { CheckboxItem } from "@excalidraw/excalidraw/components/CheckboxItem";
import { t } from "@excalidraw/excalidraw/i18n";

import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/element/types";

import { drawingService, authService } from "../../data/supabase";

interface CloudSyncDialogProps {
  isOpen: boolean;
  onClose: () => void;
  elements: readonly ExcalidrawElement[];
  appState: AppState;
  files: BinaryFiles;
  onSaveSuccess: (drawingId: string) => void;
}

export const CloudSyncDialog: React.FC<CloudSyncDialogProps> = ({
  isOpen,
  onClose,
  elements,
  appState,
  files,
  onSaveSuccess,
}) => {
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error("Error checking user:", err);
      }
    };

    if (isOpen) {
      checkUser();
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError(t("cloudSync.titleRequired"));
      return;
    }

    if (!user) {
      setError(t("cloudSync.loginRequired"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const savedDrawing = await drawingService.saveDrawing(
        title.trim(),
        elements as ExcalidrawElement[],
        appState,
        files,
        isPublic,
      );

      onSaveSuccess(savedDrawing.id);
      onClose();
    } catch (err: any) {
      setError(err.message || t("cloudSync.saveError"));
    } finally {
      setLoading(false);
    }
  };

  const generateDefaultTitle = () => {
    const now = new Date();
    return `Drawing ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
  };

  useEffect(() => {
    if (isOpen && !title) {
      setTitle(generateDefaultTitle());
    }
  }, [isOpen, title]);

  if (!isOpen) {
    return null;
  }

  if (!user) {
    return (
      <Dialog
        onCloseRequest={onClose}
        title={t("cloudSync.saveToCloud")}
        className="cloud-sync-dialog"
      >
        <div className="cloud-sync-content">
          <p>{t("cloudSync.loginRequiredMessage")}</p>
          <DialogActionButton label={t("cloudSync.close")} onClick={onClose} />
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog
      onCloseRequest={onClose}
      title={t("cloudSync.saveToCloud")}
      className="cloud-sync-dialog"
    >
      <div className="cloud-sync-content">
        <div className="cloud-sync-field">
          <TextField
            label={t("cloudSync.title")}
            value={title}
            onChange={(value) => setTitle(value)}
            placeholder={t("cloudSync.titlePlaceholder")}
          />
        </div>

        <div className="cloud-sync-field">
          <CheckboxItem
            checked={isPublic}
            onChange={(checked) => setIsPublic(checked)}
          >
            {t("cloudSync.makePublic")}
          </CheckboxItem>
          <div className="cloud-sync-help-text">
            {t("cloudSync.publicDescription")}
          </div>
        </div>

        {error && <div className="cloud-sync-error">{error}</div>}

        <div className="cloud-sync-actions">
          <DialogActionButton
            label={loading ? t("cloudSync.saving") : t("cloudSync.save")}
            onClick={handleSave}
            disabled={loading}
          />

          <Button onSelect={onClose} className="cloud-sync-cancel">
            {t("cloudSync.cancel")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
