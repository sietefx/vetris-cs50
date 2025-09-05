import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Users, Calendar, ArrowRight, PawPrint } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function FeaturedChallenge() {
  // Dados simulados para um desafio em destaque
  const featuredChallenge = {
    id: "challenge1",
    title: "Desafio de Caminhada 30 Dias",
    description: "Caminhe com seu pet por pelo menos 20 minutos todos os dias durante 30 dias consecutivos",
    image_url: "https://images.unsplash.com/photo-1532117182044-484a5e19f37d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    start_date: "2023-12-01",
    end_date: "2023-12-31",
    participants: 124,
    category: "atividade",
    points: 500,
    progress: 40
  };

  return (
    <Card className="overflow-hidden">
      <div 
        className="h-24 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${featuredChallenge.image_url})` 
        }}
      >
        <div className="w-full h-full bg-gradient-to-b from-purple-500/50 to-purple-900/70 flex items-center justify-center">
          <Award className="h-8 w-8 text-white drop-shadow-md" />
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base font-medium">
              {featuredChallenge.title}
            </CardTitle>
            <CardDescription className="line-clamp-2 text-xs">
              {featuredChallenge.description}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
            {featuredChallenge.points} pontos
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span className="text-xs">{featuredChallenge.participants} participantes</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span className="text-xs">Termina em 15 dias</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Progresso</span>
            <span>{featuredChallenge.progress}%</span>
          </div>
          <Progress value={featuredChallenge.progress} className="h-2" />
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button variant="outline" size="sm" className="w-full text-xs">
          <PawPrint className="h-3 w-3 mr-1" />
          Participar do Desafio
        </Button>
      </CardFooter>
    </Card>
  );
}