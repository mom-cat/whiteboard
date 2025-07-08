import React, { useState, useEffect, useCallback } from "react";
import { Dialog } from "@excalidraw/excalidraw/components/Dialog";
import DialogActionButton from "@excalidraw/excalidraw/components/DialogActionButton";
import { TextField } from "@excalidraw/excalidraw/components/TextField";
import { Button } from "@excalidraw/excalidraw/components/Button";
import Spinner from "@excalidraw/excalidraw/components/Spinner";
import { t } from "@excalidraw/excalidraw/i18n";

import { drawingService, authService } from "../../data/supabase";

import type { DrawingData } from "../../data/supabase";

// Type for drawing list items (subset of DrawingData)
interface DrawingListItem {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_public?: boolean;
  user_profiles?: { display_name: string }[];
}

interface CloudDrawingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDrawing: (drawingData: DrawingData) => void;
}

export const CloudDrawingsDialog: React.FC<CloudDrawingsDialogProps> = ({
  isOpen,
  onClose,
  onLoadDrawing,
}) => {
  const [activeTab, setActiveTab] = useState<"my" | "public">("my");
  const [myDrawings, setMyDrawings] = useState<DrawingListItem[]>([]);
  const [publicDrawings, setPublicDrawings] = useState<DrawingListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
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

  const loadDrawings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      if (activeTab === "my") {
        const drawings = await drawingService.getUserDrawings();
        setMyDrawings(drawings);
      } else {
        const drawings = await drawingService.getPublicDrawings();
        setPublicDrawings(drawings);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load drawings");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (isOpen && user) {
      loadDrawings();
    }
  }, [isOpen, user, activeTab, loadDrawings]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadDrawings();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const results = await drawingService.searchDrawings(
        searchQuery,
        activeTab === "public",
      );

      if (activeTab === "my") {
        setMyDrawings(results);
      } else {
        setPublicDrawings(results);
      }
    } catch (err: any) {
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDrawing = async (drawingId: string) => {
    setLoading(true);
    setError("");

    try {
      const drawingData = await drawingService.loadDrawing(drawingId);
      onLoadDrawing(drawingData);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to load drawing");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDrawing = async (drawingId: string) => {
    if (!confirm(t("cloudSync.confirmDelete"))) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await drawingService.deleteDrawing(drawingId);
      loadDrawings(); // Refresh the list
    } catch (err: any) {
      setError(err.message || "Failed to delete drawing");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return `${new Date(dateString).toLocaleDateString()} ${new Date(
      dateString,
    ).toLocaleTimeString()}`;
  };

  const currentDrawings = activeTab === "my" ? myDrawings : publicDrawings;

  if (!isOpen) {
    return null;
  }

  if (!user) {
    return (
      <Dialog
        onCloseRequest={onClose}
        title={t("cloudSync.loadFromCloud")}
        className="cloud-drawings-dialog"
      >
        <div className="cloud-drawings-content">
          <p>{t("cloudSync.loginRequiredMessage")}</p>
          <DialogActionButton label={t("cloudSync.close")} onClick={onClose} />
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog
      onCloseRequest={onClose}
      title={t("cloudSync.loadFromCloud")}
      className="cloud-drawings-dialog"
    >
      <div className="cloud-drawings-content">
        {/* Tab Navigation */}
        <div className="cloud-drawings-tabs">
          <button
            className={`tab ${activeTab === "my" ? "active" : ""}`}
            onClick={() => setActiveTab("my")}
          >
            {t("cloudSync.myDrawings")}
          </button>
          <button
            className={`tab ${activeTab === "public" ? "active" : ""}`}
            onClick={() => setActiveTab("public")}
          >
            {t("cloudSync.publicDrawings")}
          </button>
        </div>

        {/* Search */}
        <div className="cloud-drawings-search">
          <TextField
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t("cloudSync.searchDrawings")}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <Button onSelect={handleSearch}>Search</Button>
        </div>

        {/* Error Display */}
        {error && <div className="cloud-drawings-error">{error}</div>}

        {/* Loading Spinner */}
        {loading && (
          <div className="cloud-drawings-loading">
            <Spinner />
          </div>
        )}

        {/* Drawings List */}
        <div className="cloud-drawings-list">
          {currentDrawings.length === 0 && !loading ? (
            <div className="no-drawings">{t("cloudSync.noDrawings")}</div>
          ) : (
            currentDrawings.map((drawing) => (
              <div key={drawing.id} className="drawing-item">
                <div className="drawing-info">
                  <h3 className="drawing-title">{drawing.title}</h3>
                  <p className="drawing-date">
                    {t("cloudSync.lastModified")}:{" "}
                    {formatDate(drawing.updated_at)}
                  </p>
                  {drawing.is_public && (
                    <span className="public-badge">Public</span>
                  )}
                </div>
                <div className="drawing-actions">
                  <Button
                    onSelect={() => handleLoadDrawing(drawing.id)}
                    disabled={loading}
                  >
                    Load
                  </Button>
                  {activeTab === "my" && (
                    <Button
                      onSelect={() => handleDeleteDrawing(drawing.id)}
                      disabled={loading}
                      className="delete-button"
                    >
                      {t("cloudSync.deleteDrawing")}
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="cloud-drawings-actions">
          <DialogActionButton label={t("cloudSync.close")} onClick={onClose} />
        </div>
      </div>
    </Dialog>
  );
};
