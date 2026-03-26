interface FilePreviewProps {
  file: {
    name: string;
    size: number;
    type: string;
    previewUrl: string | null;
    width?: number;
    height?: number;
  };
  onReset: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatType(type: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "JPG",
    "image/png": "PNG",
    "application/pdf": "PDF",
  };
  return map[type] || type;
}

export default function FilePreview({ file, onReset }: FilePreviewProps) {
  return (
    <div className="w-full max-w-2xl mx-auto bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Preview imagine */}
      {file.previewUrl && (
        <div className="bg-[#fafafa] p-6 flex items-center justify-center border-b border-border">
          <img
            src={file.previewUrl}
            alt={file.name}
            className="max-h-80 max-w-full object-contain rounded-lg"
          />
        </div>
      )}

      {/* PDF placeholder */}
      {file.type === "application/pdf" && (
        <div className="bg-[#fafafa] p-12 flex flex-col items-center justify-center border-b border-border">
          <svg
            className="w-16 h-16 text-red-500 mb-2"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
            <text x="8" y="17" fontSize="6" fontWeight="bold" fill="currentColor">
              PDF
            </text>
          </svg>
          <p className="text-muted text-sm">Fișier PDF</p>
        </div>
      )}

      {/* Info fișier */}
      <div className="p-6">
        <h3 className="font-semibold text-foreground text-lg truncate mb-3">
          {file.name}
        </h3>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-background rounded-lg p-3">
            <span className="text-muted block text-xs mb-1">Format</span>
            <span className="font-medium">{formatType(file.type)}</span>
          </div>
          <div className="bg-background rounded-lg p-3">
            <span className="text-muted block text-xs mb-1">Mărime</span>
            <span className="font-medium">{formatSize(file.size)}</span>
          </div>
          {file.width && file.height && (
            <>
              <div className="bg-background rounded-lg p-3">
                <span className="text-muted block text-xs mb-1">Dimensiuni</span>
                <span className="font-medium">
                  {file.width} x {file.height} px
                </span>
              </div>
              <div className="bg-background rounded-lg p-3">
                <span className="text-muted block text-xs mb-1">Rezoluție</span>
                <span className="font-medium">
                  {Math.round((file.width / (90 / 25.4)) * 10) / 10} DPI
                  <span className="text-xs text-muted ml-1">(la 90mm)</span>
                </span>
              </div>
            </>
          )}
        </div>

        <button
          onClick={onReset}
          className="mt-6 w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-colors cursor-pointer"
        >
          Încarcă alt fișier
        </button>
      </div>
    </div>
  );
}
