import { useCallback } from "react";
import { toast, ToastOptions } from "react-hot-toast";

type Message = string | undefined | null;

export const showSuccessToast = (message: Message, options?: ToastOptions) => {
  if (!message) return;
  toast.success(message, options);
};

export const showErrorToast = (message: Message, options?: ToastOptions) => {
  if (!message) return;
  toast.error(message, options);
};

export const showInfoToast = (message: Message, options?: ToastOptions) => {
  if (!message) return;
  toast(message, options);
};

export const useToast = () => {
  const success = useCallback((message: Message, options?: ToastOptions) => {
    showSuccessToast(message, options);
  }, []);

  const error = useCallback((message: Message, options?: ToastOptions) => {
    showErrorToast(message, options);
  }, []);

  const info = useCallback((message: Message, options?: ToastOptions) => {
    showInfoToast(message, options);
  }, []);

  const dismiss = useCallback((toastId?: string) => {
    toast.dismiss(toastId);
  }, []);

  return {
    success,
    error,
    info,
    dismiss,
  };
};
