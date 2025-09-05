import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Syringe, Plus, ChevronRight } from "lucide-react";

export default function UpcomingVaccines({ pet }) {
  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Syringe className="h-5 w-5 text-green-600" />
          <CardTitle className="text-xl">Próximas Vacinas</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent>
        {(!pet?.vaccinations || pet.vaccinations.length === 0) ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg mb-8">
              Sem vacinas agendadas
            </p>
            
            <div className="flex items-center justify-between gap-4">
              <Link 
                to={createPageUrl("Health?tab=vaccines")} 
                className="text-purple-600 hover:text-purple-700 font-medium flex items-center"
              >
                Histórico de vacinas
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>

              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => {/* Adicionar lógica para registrar vacina */}}
              >
                <Plus className="h-4 w-4" />
                Registrar Vacina
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Lista de vacinas agendadas aqui */}
            <div className="mb-4">
              {/* Seu código existente para lista de vacinas */}
            </div>

            <div className="flex items-center justify-between gap-4">
              <Link 
                to={createPageUrl("Health?tab=vaccines")} 
                className="text-purple-600 hover:text-purple-700 font-medium flex items-center"
              >
                Histórico de vacinas
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>

              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => {/* Adicionar lógica para registrar vacina */}}
              >
                <Plus className="h-4 w-4" />
                Registrar Vacina
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}