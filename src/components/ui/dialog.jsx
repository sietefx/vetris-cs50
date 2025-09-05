
import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Componente de Overlay
const DialogOverlay = ({ show, onClose }) => {
  if (!show) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      onClick={onClose}
    />
  );
};

// Componente de Conteúdo do Diálogo
const DialogContent = React.forwardRef(({ 
  className, 
  children,
  onEscapeKeyDown,
  ...props 
}, ref) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        ref={ref}
        className={cn(
          "relative w-full bg-white shadow-lg rounded-lg max-h-[90vh] overflow-y-auto",
          // CORREÇÃO: Padding responsivo melhorado
          "p-4 sm:p-6 md:p-8",
          // CORREÇÃO: Max width responsivo
          "max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl",
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    </div>
  );
});
DialogContent.displayName = "DialogContent";

// Componente principal do Diálogo
const Dialog = ({ 
  open, 
  onOpenChange, 
  children 
}) => {
  useEffect(() => {
    if (!open) return;
    
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && onOpenChange) {
        onOpenChange(false);
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="relative">
      <DialogOverlay show={open} onClose={() => onOpenChange(false)} />
      {children}
    </div>
  );
};

// Componente do Cabeçalho
const DialogHeader = ({
  className,
  ...props
}) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left mb-4 sm:mb-6", className)}
    {...props}
  />
);

// Componente do Rodapé
const DialogFooter = ({
  className,
  ...props
}) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4 sm:mt-6", className)}
    {...props}
  />
);

// Componente do Título
const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

// Componente da Descrição
const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-500", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

// Componente do Botão de Fechar
const DialogClose = ({ onClose }) => (
  <button
    onClick={onClose}
    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
  >
    <X className="h-4 w-4" />
    <span className="sr-only">Close</span>
  </button>
);

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose
};
