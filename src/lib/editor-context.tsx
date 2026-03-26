"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { FileData, ProcessingParams, CropArea, DpiCheckResult, EditorState } from "@/types";
import { DEFAULT_PARAMS } from "@/lib/constants";

interface EditorContextType extends EditorState {
  setFileData: (data: FileData) => void;
  updateParams: (updates: Partial<ProcessingParams>) => void;
  setCropArea: (area: CropArea | undefined) => void;
  setCropMode: (on: boolean) => void;
  setProcessing: (on: boolean) => void;
  setPdfUrl: (url: string | null) => void;
  setError: (err: string | null) => void;
  setDpiCheck: (result: DpiCheckResult | null) => void;
  setAiProgress: (step: string | null) => void;
  reset: () => void;
}

const EditorContext = createContext<EditorContextType | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EditorState>({
    fileData: null,
    params: { ...DEFAULT_PARAMS },
    cropArea: undefined,
    cropMode: false,
    processing: false,
    pdfUrl: null,
    error: null,
    dpiCheck: null,
    aiProgress: null,
  });

  const setFileData = useCallback((data: FileData) => {
    setState((s) => ({ ...s, fileData: data, pdfUrl: null, error: null, dpiCheck: null }));
  }, []);

  const updateParams = useCallback((updates: Partial<ProcessingParams>) => {
    setState((s) => ({
      ...s,
      params: { ...s.params, ...updates },
      pdfUrl: null,
    }));
  }, []);

  const setCropArea = useCallback((area: CropArea | undefined) => {
    setState((s) => ({ ...s, cropArea: area }));
  }, []);

  const setCropMode = useCallback((on: boolean) => {
    setState((s) => ({ ...s, cropMode: on }));
  }, []);

  const setProcessing = useCallback((on: boolean) => {
    setState((s) => ({ ...s, processing: on }));
  }, []);

  const setPdfUrl = useCallback((url: string | null) => {
    setState((s) => ({ ...s, pdfUrl: url }));
  }, []);

  const setError = useCallback((err: string | null) => {
    setState((s) => ({ ...s, error: err }));
  }, []);

  const setDpiCheck = useCallback((result: DpiCheckResult | null) => {
    setState((s) => ({ ...s, dpiCheck: result }));
  }, []);

  const setAiProgress = useCallback((step: string | null) => {
    setState((s) => ({ ...s, aiProgress: step }));
  }, []);

  const reset = useCallback(() => {
    if (state.fileData?.previewUrl) URL.revokeObjectURL(state.fileData.previewUrl);
    if (state.pdfUrl) URL.revokeObjectURL(state.pdfUrl);
    setState({
      fileData: null,
      params: { ...DEFAULT_PARAMS },
      cropArea: undefined,
      cropMode: false,
      processing: false,
      pdfUrl: null,
      error: null,
      dpiCheck: null,
      aiProgress: null,
    });
  }, [state.fileData, state.pdfUrl]);

  return (
    <EditorContext.Provider
      value={{
        ...state,
        setFileData,
        updateParams,
        setCropArea,
        setCropMode,
        setProcessing,
        setPdfUrl,
        setError,
        setDpiCheck,
        setAiProgress,
        reset,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used within EditorProvider");
  return ctx;
}
