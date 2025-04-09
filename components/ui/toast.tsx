"use client"
import { toast as sonnerToast } from "sonner"
import { Check, Info, AlertTriangle, X, Bell } from "lucide-react"

export type ToastProps = {
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export type ToastActionElement = {
  label: string
  onClick: () => void
}

export const toast = {
  success: ({ title, description, action }: ToastProps) => {
    return sonnerToast.success(title, {
      description,
      icon: <Check className="h-4 w-4 text-green-500" />,
      action: action
        ? {
            label: action.label,
            onClick: action.onClick,
          }
        : undefined,
      className: "toast-success",
    })
  },

  error: ({ title, description, action }: ToastProps) => {
    return sonnerToast.error(title, {
      description,
      icon: <X className="h-4 w-4 text-red-500" />,
      action: action
        ? {
            label: action.label,
            onClick: action.onClick,
          }
        : undefined,
      className: "toast-error",
    })
  },

  info: ({ title, description, action }: ToastProps) => {
    return sonnerToast.info(title, {
      description,
      icon: <Info className="h-4 w-4 text-blue-500" />,
      action: action
        ? {
            label: action.label,
            onClick: action.onClick,
          }
        : undefined,
      className: "toast-info",
    })
  },

  warning: ({ title, description, action }: ToastProps) => {
    return sonnerToast.warning(title, {
      description,
      icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
      action: action
        ? {
            label: action.label,
            onClick: action.onClick,
          }
        : undefined,
      className: "toast-warning",
    })
  },

  event: ({ title, description, action }: ToastProps) => {
    return sonnerToast(title, {
      description,
      icon: <Bell className="h-4 w-4 text-primary" />,
      action: action
        ? {
            label: action.label,
            onClick: action.onClick,
          }
        : undefined,
      className: "toast-event",
    })
  },

  // Expose the original toast function for custom use cases
  custom: sonnerToast,

  // Expose dismiss function
  dismiss: (toastId?: string) => sonnerToast.dismiss(toastId),

  // Expose promise function
  promise: sonnerToast.promise,
}
