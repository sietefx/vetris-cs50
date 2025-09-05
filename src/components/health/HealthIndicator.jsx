import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Activity, AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function HealthIndicator({ type, value, trend, date, status }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800';
      case 'alerta':
        return 'bg-yellow-100 text-yellow-800';
      case 'crítico':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = () => {
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
    <Card className="p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Activity className="w-5 h-5 text-purple-500" />
        <div>
          <p className="text-sm font-medium">{type}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Badge className={getStatusColor(status)}>{status}</Badge>
        {trend && (
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span className="text-xs text-gray-500">{date}</span>
          </div>
        )}
      </div>
    </Card>
  );
}