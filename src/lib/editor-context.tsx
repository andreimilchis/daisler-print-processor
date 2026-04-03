'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { FileData, ProcessingParams, EditorState, ProcessResult, ImpositionParams } from '@/types';
import { DEFAULT_PARAMS, FORMAT_PRESETS, DEFAULT_IMPOSITION } from '@/lib/constants';

interface EditorContextType extends EditorState {
  setFileData: (data: FileData | null) => void;
  updateParams: (updates: Partial<ProcessingParams>) => void;
  applyPreset: (presetName: string) => void;
  updateImposition: (updates: Partial<ImpositionParams>) => void;
  resetAll: () => void;
  processFile: () => Promise<void>;
}

const EditorContext = createContext<EditorContextType | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [fileData, setFileDataState] = useState<FileData | null>(null);
  const [params, setParams] = useState<ProcessingParams>(DEFAULT_PARAMS);
  const [selectedPreset, setSelectedPreset] = useState<string>('business-card');
  const [processResult, setProcessResult] = useState<ProcessResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [impositionParams, setImpositionParams] = useState<ImpositionParams>(DEFAULT_IMPOSITION);

  const setFileData = useCallback((data: FileData | null) => {
    setFileDataState(data);
    setProcessResult(null);
    setProcessError(null);
  }, []);

  const updateParams = useCallback((updates: Partial<ProcessingParams>) => {
    setParams(prev => ({ ...prev, ...updates }));
    setSelectedPreset('custom');
    setProcessResult(null);
  }, []);

  const applyPreset = useCallback((presetName: string) => {
    if (presetName === 'custom') {
      setSelectedPreset('custom');
      return;
    }
    const preset = FORMAT_PRESETS.find(p => p.name === presetName);
    if (preset) {
      setParams(prev => ({
        width: preset.width,
        height: preset.height,
        dpi: preset.dpi,
        bleed: preset.bleed,
        safeMargin: preset.safeMargin,
        cutContour: prev.cutContour,
        useAiBleed: prev.useAiBleed,
        useAiUpscale: prev.useAiUpscale,
      }));
      // Update default imposition spacing when bleed changes
      setImpositionParams(prev => ({
        ...prev,
        spacing: preset.bleed > 0 ? preset.bleed * 2 : 6,
      }));
      setSelectedPreset(presetName);
      setProcessResult(null);
    }
  }, []);

  const updateImposition = useCallback((updates: Partial<ImpositionParams>) => {
    setImpositionParams(prev => ({ ...prev, ...updates }));
  }, []);

  const processFile = useCallback(async () => {
    if (!fileData) return;

    setIsProcessing(true);
    setProcessError(null);
    setProcessResult(null);

    try {
      const formData = new FormData();
      formData.append('file', fileData.file);
      formData.append(
        'params',
        JSON.stringify({
          width: params.width,
          height: params.height,
          dpi: params.dpi,
          bleed: params.bleed,
          useAiBleed: params.useAiBleed,
          useAiUpscale: params.useAiUpscale,
        })
      );

      const res = await fetch('/api/process', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        setProcessError(data.error ?? 'Eroare necunoscută la procesare.');
        return;
      }

      setProcessResult(data as ProcessResult);
    } catch {
      setProcessError('Nu s-a putut contacta serverul. Încearcă din nou.');
    } finally {
      setIsProcessing(false);
    }
  }, [fileData, params]);

  const resetAll = useCallback(() => {
    setFileDataState(null);
    setParams(DEFAULT_PARAMS);
    setSelectedPreset('business-card');
    setProcessResult(null);
    setProcessError(null);
    setImpositionParams(DEFAULT_IMPOSITION);
  }, []);

  return (
    <EditorContext.Provider
      value={{
        fileData,
        params,
        selectedPreset,
        processResult,
        isProcessing,
        processError,
        impositionParams,
        setFileData,
        updateParams,
        applyPreset,
        updateImposition,
        resetAll,
        processFile,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within EditorProvider');
  }
  return context;
}
