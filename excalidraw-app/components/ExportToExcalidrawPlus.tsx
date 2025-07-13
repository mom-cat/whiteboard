import React, { useState } from "react";
import { nanoid } from "nanoid";

import { trackEvent } from "@excalidraw/excalidraw/analytics";
import { Card } from "@excalidraw/excalidraw/components/Card";
import { ExcalidrawLogo } from "@excalidraw/excalidraw/components/ExcalidrawLogo";
import { ToolButton } from "@excalidraw/excalidraw/components/ToolButton";
import { MIME_TYPES, getFrame } from "@excalidraw/common";
import {
  encryptData,
  generateEncryptionKey,
} from "@excalidraw/excalidraw/data/encryption";
import { serializeAsJSON } from "@excalidraw/excalidraw/data/json";
import { isInitializedImageElement } from "@excalidraw/element";
import { useI18n } from "@excalidraw/excalidraw/i18n";

import type {
  FileId,
  NonDeletedExcalidrawElement,
} from "@excalidraw/element/types";
import type {
  AppState,
  BinaryFileData,
  BinaryFiles,
} from "@excalidraw/excalidraw/types";

import { FILE_UPLOAD_MAX_BYTES } from "../app_constants";
import { authService, supabase } from "../data/supabase";

export const exportToExcalidrawPlus = async (
  elements: readonly NonDeletedExcalidrawElement[],
  appState: Partial<AppState>,
  files: BinaryFiles,
  name: string,
) => {
  // Check if user is authenticated
  const user = await authService.getCurrentUser();
  if (!user) {
    throw new Error("Please sign in to export to Excalidraw+");
  }

  console.log("Debug - Current user:", {
    id: user.id,
    email: user.email,
    aud: user.aud,
    role: user.role
  });

  const bucketName = import.meta.env.VITE_SUPABASE_BUCKET || "excalidraw-exports";
  const id = `${nanoid(12)}`;

  const encryptionKey = (await generateEncryptionKey())!;
  const encryptedData = await encryptData(
    encryptionKey,
    serializeAsJSON(elements, appState, files, "database"),
  );

  const blob = new Blob(
    [encryptedData.iv, new Uint8Array(encryptedData.encryptedBuffer)],
    {
      type: MIME_TYPES.binary,
    },
  );

  // Note: Bucket 'excalidraw-exports' should be pre-created by admin with proper RLS policies

  // Upload main scene data to Supabase Storage
  // Use user ID in path for RLS compliance
  const sceneFileName = `${user.id}/scenes/${id}`;
  
  console.log("Debug - Upload attempt:", {
    bucketName,
    sceneFileName,
    userId: user.id,
    blobSize: blob.size
  });

  const { error: sceneUploadError, data: uploadData } = await supabase.storage
    .from(bucketName)
    .upload(sceneFileName, blob, {
      metadata: {
        version: "2",
        name: name,
        created: Date.now().toString(),
        userId: user.id,
      },
    });

  if (sceneUploadError) {
    console.error("Scene upload error details:", {
      error: sceneUploadError,
      message: sceneUploadError.message,
      details: sceneUploadError
    });
    throw new Error(`Failed to upload scene: ${sceneUploadError.message}`);
  }

  console.log("Scene upload successful:", uploadData);

  // Upload associated files if any
  const filesMap = new Map<FileId, BinaryFileData>();
  for (const element of elements) {
    if (isInitializedImageElement(element) && files[element.fileId]) {
      filesMap.set(element.fileId, files[element.fileId]);
    }
  }

  if (filesMap.size) {
    for (const [fileId, fileData] of filesMap) {
      const fileBlob = new Blob([fileData.dataURL], { type: fileData.mimeType });
      // Use user ID in path for RLS compliance
      const fileName = `${user.id}/files/scenes/${id}/${fileId}`;
      
      const { error: fileUploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, fileBlob, {
          metadata: {
            originalName: fileData.id,
            mimeType: fileData.mimeType,
            userId: user.id,
          },
        });

      if (fileUploadError) {
        console.warn(`Failed to upload file ${fileId}:`, fileUploadError.message);
      }
    }
  }
  // window.open(
  //   `${
  //     import.meta.env.VITE_APP_PLUS_APP
  //   }/import?excalidraw=${id},${encryptionKey}`,
  // );
  window.open(`${window.location.origin}?excalidraw=${id},${encryptionKey}`);
};

export const ExportToExcalidrawPlus: React.FC<{
  elements: readonly NonDeletedExcalidrawElement[];
  appState: Partial<AppState>;
  files: BinaryFiles;
  name: string;
  onError: (error: Error) => void;
  onSuccess: () => void;
  onAuthRequired?: () => void;
  user?: any; // Accept user from parent component
}> = ({ elements, appState, files, name, onError, onSuccess, onAuthRequired, user }) => {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    if (!user) {
      if (onAuthRequired) {
        onAuthRequired();
      } else {
        onError(new Error(t("auth.signInRequired") || "Please sign in to export to Excalidraw+"));
      }
      return;
    }

    setIsLoading(true);
    try {
      trackEvent("export", "eplus", `ui (${getFrame()})`);
      await exportToExcalidrawPlus(elements, appState, files, name);
      onSuccess();
    } catch (error: any) {
      console.error(error);
      if (error.name !== "AbortError") {
        onError(new Error(error.message || t("exportDialog.excalidrawplus_exportError")));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card color="primary">
      <div className="Card-icon">
        <ExcalidrawLogo
          style={{
            [`--color-logo-icon` as any]: "#fff",
            width: "2.8rem",
            height: "2.8rem",
          }}
        />
      </div>
      <h2>Excalidraw+</h2>
      <div className="Card-details">
        {user 
          ? t("exportDialog.excalidrawplus_description")
          : t("exportDialog.excalidrawplus_signInRequired") || "Sign in to export to your Excalidraw+ workspace"
        }
      </div>
      <ToolButton
        className="Card-button"
        type="button"
        title={user ? t("exportDialog.excalidrawplus_button") : t("auth.signIn")}
        aria-label={user ? t("exportDialog.excalidrawplus_button") : t("auth.signIn")}
        showAriaLabel={true}
        disabled={isLoading}
        onClick={handleExport}
      />
      {isLoading && (
        <div style={{ textAlign: "center", marginTop: "0.5rem", fontSize: "0.875rem" }}>
          {t("exportDialog.excalidrawplus_uploading") || "Uploading..."}
        </div>
      )}
    </Card>
  );
};

export default ExportToExcalidrawPlus;