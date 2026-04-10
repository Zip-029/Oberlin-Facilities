import React, { useCallback, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, FileSpreadsheet, Loader2, CheckCircle2, X, ArrowRight } from 'lucide-react';
import { useWorkOrders } from '@/context/WorkOrderContext';
import { useNavigate } from 'react-router';

type UploadStatus = 'idle' | 'preview' | 'uploading' | 'analyzing' | 'done';

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [isGlowing, setIsGlowing] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const { loadFiles } = useWorkOrders();
  const navigate = useNavigate();

  // Stage 1 → 2: select files, show preview
  const handleFilesChosen = useCallback((files: File[]) => {
    setSelectedFiles(files);
    setUploadStatus('preview');
  }, []);

  // Stage 2 → 3: user confirms, start processing
  const startProcess = useCallback(async () => {
    setUploadStatus('uploading');
    setProgressValue(0);

    for (let i = 0; i <= 50; i += 10) {
      setProgressValue(i);
      await new Promise((r) => setTimeout(r, 120));
    }

    setUploadStatus('analyzing');
    for (let i = 50; i <= 90; i += 10) {
      setProgressValue(i);
      await new Promise((r) => setTimeout(r, 150));
    }

    await loadFiles(selectedFiles);

    setProgressValue(100);
    setUploadStatus('done');
    // Navigate to dashboard — data is now loaded
    setTimeout(() => navigate('/dashboard', { replace: true }), 400);
  }, [loadFiles, selectedFiles, navigate]);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) setUploadStatus('idle');
      return next;
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFilesChosen(Array.from(e.dataTransfer.files));
      }
    },
    [handleFilesChosen]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFilesChosen(Array.from(e.target.files));
      }
      // Reset input so same files can be re-selected
      e.target.value = '';
    },
    [handleFilesChosen]
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  useEffect(() => {
    const handleGlow = () => {
      setIsGlowing(true);
      setTimeout(() => setIsGlowing(false), 2000);
    };
    window.addEventListener('glow-upload-card', handleGlow);
    return () => window.removeEventListener('glow-upload-card', handleGlow);
  }, []);

  // ── IDLE: drop zone ──────────────────────────────────────────────────────────
  if (uploadStatus === 'idle') {
    return (
      <div className="flex flex-1 items-center justify-center py-12 px-4 lg:px-6">
        <Card
          className={`w-full max-w-2xl border-2 border-dashed transition-all duration-200 ${
            isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border'
          } ${isGlowing ? 'ring-4 ring-primary/50 border-primary scale-[1.01]' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardHeader className="flex flex-col items-center text-center pb-4 pt-10">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <FileSpreadsheet className="size-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Upload TopDesk Exports
            </CardTitle>
            <CardDescription className="max-w-md mx-auto pt-2 text-base leading-relaxed text-center">
              Drop your <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">.xlsx</code> files here to generate workspace analytics. We automatically merge and deduplicate tracking data.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-10">
            <Button
              className="relative overflow-hidden cursor-pointer rounded-full px-8 shadow-sm transition-all"
              size="lg"
            >
              <UploadCloud className="mr-2 size-5" />
              Select Files to Upload
              <input
                title="Upload TopDesk files"
                aria-label="Upload TopDesk files"
                type="file"
                multiple
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="absolute inset-0 size-full cursor-pointer opacity-0"
              />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── PREVIEW: confirm before processing ──────────────────────────────────────
  if (uploadStatus === 'preview') {
    return (
      <div className="flex flex-1 items-center justify-center py-12 px-4 lg:px-6">
        <Card className="w-full max-w-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold tracking-tight">
                  Ready to Upload
                </CardTitle>
                <CardDescription className="pt-1">
                  {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected — review before processing
                </CardDescription>
              </div>
              {/* Add more files */}
              <Button variant="outline" size="sm" className="relative overflow-hidden shrink-0">
                <UploadCloud className="mr-1.5 size-4" />
                Add Files
                <input
                  title="Add more files"
                  type="file"
                  multiple
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
                      e.target.value = '';
                    }
                  }}
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            {/* File grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {selectedFiles.map((file, i) => (
                <div
                  key={i}
                  className="group relative flex flex-col gap-2 rounded-xl border bg-card p-3.5 shadow-sm hover:bg-muted/50 transition-colors"
                >
                  {/* Remove button */}
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute top-2 right-2 size-5 rounded-full bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="size-3" />
                  </button>
                  <div className="rounded-lg bg-primary/10 p-2 w-fit">
                    <FileSpreadsheet className="size-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug line-clamp-2 text-foreground">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatSize(file.size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setSelectedFiles([]); setUploadStatus('idle'); }}
                className="text-muted-foreground"
              >
                Cancel
              </Button>
              <Button
                size="lg"
                onClick={startProcess}
                className="rounded-full px-8 shadow-sm transition-all"
              >
                Upload & Analyze
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── UPLOADING / ANALYZING / DONE ─────────────────────────────────────────────
  return (
    <div className="flex flex-1 items-center justify-center py-12 px-4 lg:px-6">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center pb-4 pt-10">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            {uploadStatus === 'done' ? (
              <CheckCircle2 className="size-8 text-primary" />
            ) : (
              <Loader2 className="size-8 text-primary animate-spin" />
            )}
          </div>
          <CardTitle className="text-xl font-bold tracking-tight">
            {uploadStatus === 'uploading'
              ? 'Uploading Files…'
              : uploadStatus === 'analyzing'
              ? 'Generating Analytics…'
              : 'Complete!'}
          </CardTitle>
          <CardDescription className="pt-2">
            {uploadStatus === 'uploading' && 'Securely standardizing your dataset…'}
            {uploadStatus === 'analyzing' && 'Crunching the numbers and preparing visuals…'}
            {uploadStatus === 'done' && 'Redirecting you to the dashboard…'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-10">
          <div className="mx-auto max-w-md px-4">
            <Progress value={progressValue} className="mb-6 h-2.5 w-full bg-muted" />

            <h4 className="mb-3 text-sm font-semibold text-foreground">
              Files in queue ({selectedFiles.length})
            </h4>
            {/* Grid during processing too */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {selectedFiles.map((file, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-1.5 rounded-xl border bg-card p-3 shadow-sm"
                >
                  <div className="rounded-lg bg-primary/10 p-1.5 w-fit">
                    <FileSpreadsheet className="size-4 text-primary" />
                  </div>
                  <p className="text-xs font-medium leading-snug line-clamp-2 text-foreground">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatSize(file.size)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
