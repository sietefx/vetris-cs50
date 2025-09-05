import React, { useState, useEffect } from "react";
import { Record } from "@/api/entities";
import { HealthLog } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scale, Activity, FileText, Syringe, Heart, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

export default function PetHealthHistory({ pet_id }) {
  const [records, setRecords] = useState([]);
  const [healthLogs, setHealthLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("30d");
  const [viewType, setViewType] = useState("list");

  useEffect(() => {
    loadData();
  }, [pet_id]);

  const loadData = async () => {
    if (!pet_id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Carregando dados de saúde para pet:", pet_id);
      
      const [recordsData, logsData] = await Promise.all([
        Record.filter({ pet_id }),
        HealthLog.filter({ pet_id })
      ]);
      
      console.log("Records carregados:", recordsData);
      console.log("Health logs carregados:", logsData);
      
      setRecords(recordsData || []);
      setHealthLogs(logsData || []);
    } catch (err) {
      console.error("Erro ao carregar histórico de saúde:", err);
      setError("Erro ao carregar os dados. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getWeightRecords = () => {
    return records
      .filter(r => r.type === "peso")
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(record => ({
        date: format(new Date(record.date), "dd/MM"),
        peso: parseFloat(record.value)
      }));
  };
  
  const getActivityRecords = () => {
    return healthLogs
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(log => ({
        date: format(new Date(log.date), "dd/MM"),
        atividade: log.activity_minutes || 0
      }));
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-purple-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{error}</p>
        <Button onClick={loadData} variant="outline" className="mt-2">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Histórico de Saúde</h2>
        
        <div className="flex items-center gap-2">
          <Label className="text-sm">Visualização:</Label>
          <Select value={viewType} onValueChange={setViewType}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Visualização" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="list">Lista</SelectItem>
              <SelectItem value="chart">Gráficos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {viewType === "list" ? (
        <div className="space-y-4">
          {/* Registros de Peso */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Scale className="h-4 w-4 text-blue-500" />
                Registros de Peso
              </CardTitle>
            </CardHeader>
            <CardContent>
              {records.filter(r => r.type === "peso").length > 0 ? (
                <div className="space-y-2">
                  {records
                    .filter(r => r.type === "peso")
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 5)
                    .map((record, idx) => (
                      <div key={idx} className="flex justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-2">
                          <Scale className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{record.value} kg</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {format(new Date(record.date), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  Nenhum registro de peso encontrado
                </p>
              )}
            </CardContent>
          </Card>
          
          {/* Registros de Atividades */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-500" />
                Atividades Físicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {healthLogs.length > 0 ? (
                <div className="space-y-2">
                  {healthLogs
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 5)
                    .map((log, idx) => (
                      <div key={idx} className="flex justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-green-500" />
                          <span className="font-medium">
                            {log.activity_minutes || 0} min • Nível: {
                              log.activity_level === "baixo" ? "Baixo" :
                              log.activity_level === "moderado" ? "Moderado" : "Alto"
                            }
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {format(new Date(log.date), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  Nenhum registro de atividade encontrado
                </p>
              )}
            </CardContent>
          </Card>
          
          {/* Vacinas */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Syringe className="h-4 w-4 text-red-500" />
                Vacinas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {records.filter(r => r.type === "vacina").length > 0 ? (
                <div className="space-y-2">
                  {records
                    .filter(r => r.type === "vacina")
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 3)
                    .map((record, idx) => (
                      <div key={idx} className="flex justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-2">
                          <Syringe className="h-4 w-4 text-red-500" />
                          <span className="font-medium">{record.value}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {format(new Date(record.date), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  Nenhum registro de vacina encontrado
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Gráfico de Peso */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Scale className="h-4 w-4 text-blue-500" />
                Evolução do Peso
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getWeightRecords().length > 1 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getWeightRecords()} margin={{ top: 5, right: 5, left: 0, bottom: 15 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="peso" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }}
                        name="Peso (kg)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-12">
                  Dados insuficientes para gerar o gráfico
                </p>
              )}
            </CardContent>
          </Card>
          
          {/* Gráfico de Atividade */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-500" />
                Atividade Física
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getActivityRecords().length > 1 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getActivityRecords()} margin={{ top: 5, right: 5, left: 0, bottom: 15 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar 
                        dataKey="atividade" 
                        fill="#82ca9d" 
                        name="Minutos de atividade"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-12">
                  Dados insuficientes para gerar o gráfico
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      <Button variant="link" onClick={loadData} className="flex items-center text-purple-600">
        Ver histórico completo
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
}