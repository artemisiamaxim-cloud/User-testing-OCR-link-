import { useRef } from "react";
import { useDropzone } from "react-dropzone";

interface UploadAreaProps {
  onFilesAdded: (files: File[]) => void;
  acceptedFileTypes?: Record<string, string[]>;
  sizeLimitMB?: number;
  multiple?: boolean;
}

export const UploadArea = ({ onFilesAdded, acceptedFileTypes, sizeLimitMB, multiple = true }: UploadAreaProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted) => onFilesAdded(accepted),
    accept: acceptedFileTypes,
    maxSize: sizeLimitMB ? sizeLimitMB * 1_000_000 : undefined,
    multiple,
  });

  return (
    <div
      {...getRootProps()}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 136,
        borderRadius: "var(--sizes-radius-md)",
        border: `1px dashed ${isDragActive ? "var(--palette-bg-accent-strong)" : "var(--palette-border-neutral-strong)"}`,
        backgroundColor: isDragActive ? "var(--palette-bg-accent-subtle)" : "var(--palette-bg-neutral-base)",
        cursor: "pointer",
        gap: 4,
        padding: 12,
        transition: "background-color 0.15s, border-color 0.15s",
      }}
    >
      <input {...getInputProps()} />
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--palette-content-neutral-subtle)" }}>
        <path d="M12 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3m7 0h3a2 2 0 0 1 2 2v3M12 4v8m0-8 3 3m-3-3-3 3M16 16l2 2 4-4" />
      </svg>
      <span style={{ fontSize: "var(--typography-fontSize-sm)", fontWeight: 600, color: "var(--palette-content-neutral-subtle)" }}>
        Drag and drop your client&rsquo;s files here. We&rsquo;ll sort them for you.
      </span>
    </div>
  );
};
