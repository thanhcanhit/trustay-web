import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "./label"

interface FormFieldProps {
  children: React.ReactNode
  className?: string
}

function FormField({ children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {children}
    </div>
  )
}

interface FormLabelProps extends React.ComponentProps<typeof Label> {
  required?: boolean
}

function FormLabel({ children, required, className, ...props }: FormLabelProps) {
  return (
    <Label className={cn("block", className)} {...props}>
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </Label>
  )
}

interface FormMessageProps extends React.ComponentProps<"p"> {
  type?: "error" | "success" | "info"
}

function FormMessage({ children, type = "error", className, ...props }: FormMessageProps) {
  if (!children) return null
  
  return (
    <p
      className={cn(
        "text-sm",
        {
          "text-red-600": type === "error",
          "text-green-600": type === "success", 
          "text-blue-600": type === "info"
        },
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
}

type FormDescriptionProps = React.ComponentProps<"p"> & {
  // Form description component props
  variant?: 'default' | 'muted';
}

function FormDescription({ children, className, ...props }: FormDescriptionProps) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  )
}

export { FormField, FormLabel, FormMessage, FormDescription }
