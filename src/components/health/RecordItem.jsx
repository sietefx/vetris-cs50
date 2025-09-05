import React, { useState } from "react";
import { Record } from "@/api/entities";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useLogger } from "@/components/utils/logger";
import { Scale, FileText, Syringe, Heart, Pill, Trash2 } from "lucide-react";

export default function RecordItem({ record, onDelete }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const logger = useLogger();

  const getIcon = () => {
    switch (record.type) {
      case "peso": return <Scale className="h-4 w-4 text-blue-600" />;
      case "exame": return <FileText className="h-4 w-4 text-green-600" />;
      case "vacina": return <Syringe className="h-4 w-4 text-red-600" />;
      case "consulta": return <Heart className="h-4 w-4 text-amber-600" />;
      case "medicamento": return <Pill className="h-4 w-4 text-purple-600" />;
      default: return null;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    
    // Adicionar um dia para compensar o problema de fuso horário
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    
    return format(date, "dd/MM/yyyy");
  };

  const handleDelete = async () => {
    if (!record || !record.id) {
      setError("ID do registro não encontrado");
      return;
    }
    
    try {
      setDeleting(true);
      setError(null);
      console.log("Tentando excluir registro com ID:", record.id);
      
      // Chamar a função de exclusão do componente pai
      if (typeof onDelete === 'function') {
        await Record.delete(record.id);
        onDelete(record.id);
        logger.info(`Registro excluído: ${record.type}`, { recordId: record.id });
      } else {
        throw new Error("Função de exclusão não disponível");
      }
    } catch (err) {
      const errorMsg = err.message || "Erro ao excluir registro";
      setError(errorMsg);
      logger.error(`Erro ao excluir registro: ${errorMsg}`, { error: err, recordId: record.id });
      console.error("Erro ao excluir registro:", err);
    } finally {
      setDeleting(false);
      if (!error) {
        setShowDeleteConfirm(false);
      }
    }
  };

  return (
    <>
      <div className="flex justify-between items-start p-3 border rounded-md hover:bg-gray-50">
        <div>
          <div className="flex items-center gap-2">
            {getIcon()}
            <span className="font-medium">{record.value}</span>
          </div>
          {record.notes && (
            <p className="text-sm text-gray-500 mt-1">{record.notes}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-sm">{formatDate(record.date)}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
              <p className="text-red-600 text-xs mt-1">ID: {record.id}</p>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Excluindo...
                </>
              ) : (
                <>Excluir</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}