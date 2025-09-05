import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, CheckCircle } from "lucide-react";

export default function HealthAlerts({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertas de Saúde</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6 text-center">
            <div>
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-green-700">Tudo em Ordem</h3>
              <p className="text-sm text-green-600">Não há alertas de saúde no momento</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          Alertas de Saúde
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert, index) => (
          <Alert
            key={index}
            variant={alert.severity === 'warning' ? 'warning' : 'info'}
          >
            {alert.severity === 'warning' ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <Info className="w-4 h-4" />
            )}
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}