import React, { useState } from 'react';
import { useLogger, LogLevel } from './utils/logger';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { AlertTriangle, Info, X, Check, AlertCircle } from 'lucide-react';

export const LogViewer = ({ maxHeight = "300px" }) => {
  const logger = useLogger();
  const [activeTab, setActiveTab] = useState("all");
  const [expanded, setExpanded] = useState({});
  
  const logs = logger.getAll();
  
  const filteredLogs = activeTab === "all" 
    ? logs 
    : logs.filter(log => log.level === activeTab);
  
  const toggleExpand = (id) => {
    setExpanded(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const getLogIcon = (level) => {
    switch(level) {
      case LogLevel.ERROR:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case LogLevel.WARNING:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case LogLevel.INFO:
        return <Info className="h-4 w-4 text-blue-500" />;
      case LogLevel.DEBUG:
        return <Check className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getLogBadgeColor = (level) => {
    switch(level) {
      case LogLevel.ERROR:
        return "bg-red-100 text-red-800 border-red-200";
      case LogLevel.WARNING:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case LogLevel.INFO:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case LogLevel.DEBUG:
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center px-4 py-2 border-b">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value={LogLevel.ERROR}>Erros</TabsTrigger>
            <TabsTrigger value={LogLevel.WARNING}>Avisos</TabsTrigger>
            <TabsTrigger value={LogLevel.INFO}>Info</TabsTrigger>
            <TabsTrigger value={LogLevel.DEBUG}>Debug</TabsTrigger>
          </TabsList>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => logger.clear()}
            className="text-gray-500 hover:text-gray-700"
          >
            Limpar
          </Button>
        </div>
        
        <TabsContent value={activeTab} className="mt-0">
          <ScrollArea style={{ maxHeight }}>
            <div className="p-4 space-y-2">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Nenhum log encontrado
                </div>
              ) : (
                filteredLogs.map(log => (
                  <div 
                    key={log.id} 
                    className="p-3 border rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">
                        {getLogIcon(log.level)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <Badge 
                            variant="outline" 
                            className={getLogBadgeColor(log.level)}
                          >
                            {log.level.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {format(new Date(log.timestamp), "dd/MM/yyyy HH:mm:ss")}
                          </span>
                        </div>
                        <p className="mt-1 font-medium text-sm">{log.message}</p>
                        
                        {log.data && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-1 p-0 h-auto text-xs text-gray-500 hover:text-gray-800"
                            onClick={() => toggleExpand(log.id)}
                          >
                            {expanded[log.id] ? "Ocultar detalhes" : "Exibir detalhes"}
                          </Button>
                        )}
                        
                        {log.data && expanded[log.id] && (
                          <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
};