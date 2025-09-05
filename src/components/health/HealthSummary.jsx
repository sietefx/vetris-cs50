import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Activity, Heart, Scale } from "lucide-react";

export default function HealthSummary({ data }) {
  const getHealthScoreColor = (score) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Índice de Saúde</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold">{data.healthScore}</span>
            <Badge className={`bg-opacity-10 ${getHealthScoreColor(data.healthScore)}`}>
              {data.healthScore >= 80 ? 'Ótimo' : 
               data.healthScore >= 60 ? 'Bom' : 'Requer Atenção'}
            </Badge>
          </div>
          <Progress value={data.healthScore} className={getHealthScoreColor(data.healthScore)} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Peso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold">{data.lastWeight} kg</span>
              {getTrendIcon(data.weightTrend)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Atividade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold capitalize">{data.recentActivity}</span>
              <Badge className={
                data.recentActivity === 'alto' ? 'bg-green-100 text-green-800' :
                data.recentActivity === 'baixo' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }>
                {data.recentActivity}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}