
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AlertDialogOverlay = ({ show, onClose }) => {
  if (!show) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      onClick={onClose}
    />
  );
};

const AlertDialogContent = React.forwardRef(({ 
  className, 
  children, 
  ...props 
}, ref) => {
  const handleContentClick = (e) => {
    // Stop propagation to prevent closing when clicking inside the content
    e.stopPropagation();
  };

  return (
    <div
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg rounded-lg max-h-[85vh] overflow-y-auto",
        className
      )}
      onClick={handleContentClick}
      {...props}
    >
      {children}
    </div>
  );
});
AlertDialogContent.displayName = "AlertDialogContent";

const AlertDialog = ({ 
  open, 
  onOpenChange, 
  children 
}) => {
  useEffect(() => {
    if (!open) return;
    
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && onOpenChange) {
        console.log('🔄 [AlertDialog] Fechando via tecla ESC');
        onOpenChange(false);
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [open, onOpenChange]);

  // Handler for clicking outside (on the backdrop)
  const handleBackdropClick = () => {
    if (onOpenChange) {
      console.log('🔄 [AlertDialog] Fechando via clique no backdrop');
      onOpenChange(false);
    }
  };

  if (!open) return null;

  return (
    <div className="relative">
      <AlertDialogOverlay show={open} onClose={handleBackdropClick} />
      {children}
    </div>
  );
};

const AlertDialogHeader = ({
  className,
  ...props
}) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
    {...props}
  />
);

const AlertDialogFooter = ({
  className,
  ...props
}) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6", className)}
    {...props}
  />
);

const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-500", className)}
    {...props}
  />
));
AlertDialogDescription.displayName = "AlertDialogDescription";

// Action buttons
const AlertDialogAction = React.forwardRef(({ className, ...props }, ref) => (
  <Button
    ref={ref}
    className={cn(className)}
    {...props}
  />
));
AlertDialogAction.displayName = "AlertDialogAction";

const AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => (
  <Button
    ref={ref}
    variant="outline"
    className={cn("mt-2 sm:mt-0", className)}
    {...props}
  />
));
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel
};
