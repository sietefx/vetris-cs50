import React, { useState } from "react";
import { VaccinationRecord } from "@/api/entities";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useLogger } from "@/components/utils/logger";
import { Syringe, Calendar, Trash2, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function VaccinationItem({ vaccine, onDelete, onEdit }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const logger = useLogger();

  const formatDate = (dateString) => {
    if (!dateString) return "";
    
    // Adicionar um dia para compensar o problema de fuso horário
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    
    return format(date, "dd/MM/yyyy");
  };

  const isVaccineOverdue = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    const nextDate = new Date(dateString);
    nextDate.setDate(nextDate.getDate() + 1); // Ajuste de fuso horário
    return nextDate < today;
  };

  const handleDelete = async () => {
    if (!vaccine || !vaccine.id) {
      setError("ID da vacina não encontrado");
      return;
    }
    
    try {
      setDeleting(true);
      setError(null);
      
      // Log para debugging
      console.log("Tentando excluir vacina com ID:", vaccine.id);
      
      // Chamar a função de exclusão do componente pai
      // em vez de chamar diretamente a API
      if (typeof onDelete === 'function') {
        await onDelete(vaccine.id);
        logger.info(`Vacina excluída: ${vaccine.name}`, { vaccineId: vaccine.id });
        setShowDeleteConfirm(false);
      } else {
        throw new Error("Função de exclusão não disponível");
      }
    } catch (err) {
      const errorMsg = err.message || "Erro ao excluir vacina";
      setError(errorMsg);
      logger.error(`Erro ao excluir vacina: ${errorMsg}`, { error: err, vaccineId: vaccine.id });
      console.error("Erro ao excluir vacina:", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-start p-3 border rounded-md hover:bg-gray-50">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Syringe className="h-4 w-4 text-red-600 flex-shrink-0" />
            <span className="font-medium">{vaccine.name}</span>
          </div>
          {vaccine.notes && (
            <p className="text-sm text-gray-500 mt-1">{vaccine.notes}</p>
          )}
          {vaccine.next_date && (
            <div className="flex items-center gap-1 mt-1">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              <p className="text-xs">
                Próxima dose: {formatDate(vaccine.next_date)}
                {isVaccineOverdue(vaccine.next_date) && (
                  <Badge className="ml-1 bg-red-100 text-red-800 text-xs px-1.5 py-0.5">
                    Atrasada
                  </Badge>
                )}
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <p className="text-sm">{formatDate(vaccine.date)}</p>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 h-7 w-7 p-0"
              onClick={() => onEdit(vaccine)}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-red-600 hover:bg-red-50 h-7 w-7 p-0"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o registro da vacina "{vaccine.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
              <p className="text-red-600 text-xs mt-1">ID: {vaccine.id}</p>
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