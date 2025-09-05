
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText, Download, Printer, Mail, Calendar,
  FileBarChart, Clipboard, Heart, Activity, Scale, 
  Droplet, UtensilsCrossed, Syringe, AlertTriangle,
  CheckCircle, Loader2, ArrowRight, Pill
} from "lucide-react";
import { format, subDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, Cell 
} from "recharts";

export default function ReportGenerator({ 
  petData, 
  reportConfig, 
  onExportPDF, 
  onPrint,
  onSendEmail, 
  onGenerateReport
}) {
  const [loading, setLoading] = useState(false);
  const [reportContent, setReportContent] = useState(null);
  const reportRef = useRef(null);
  
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

  useEffect(() => {
    if (reportConfig.isGenerating) {
      generateReportContent();
    }
  }, [reportConfig.isGenerating, petData]);

  const generateReportContent = async () => {
    if (!petData || !petData.pet) return;
    
    setLoading(true);
    
    const startDate = getStartDate(reportConfig.dateRange);
    const endDate = reportConfig.dateRange === 'custom' 
      ? new Date(reportConfig.customEndDate) 
      : new Date();
    
    const filteredRecords = petData.records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startDate && recordDate <= endDate;
    });
    
    const filteredHealthLogs = petData.healthLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= startDate && logDate <= endDate;
    });
    
    const filteredEvents = petData.events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= startDate && eventDate <= endDate;
    });
    
    const reportData = {
      pet: petData.pet,
      dateRange: {
        start: format(startDate, 'dd/MM/yyyy', { locale: ptBR }),
        end: format(endDate, 'dd/MM/yyyy', { locale: ptBR })
      },
      weight: reportConfig.metrics.weightData ? prepareWeightData(filteredRecords) : null,
      activity: reportConfig.metrics.activityData ? prepareActivityData(filteredHealthLogs) : null,
      vaccinations: reportConfig.metrics.vaccinationHistory ? prepareVaccinationData(petData.pet, filteredRecords) : null,
      medications: reportConfig.metrics.medicationHistory ? prepareMedicationData(filteredRecords, filteredEvents) : null,
      veterinaryVisits: reportConfig.metrics.veterinaryVisits ? prepareVetVisitsData(filteredEvents) : null,
      symptoms: reportConfig.metrics.symptoms ? prepareSymptomsData(filteredHealthLogs) : null,
      foodIntake: reportConfig.metrics.foodIntake ? prepareFoodData(filteredHealthLogs) : null,
      waterIntake: reportConfig.metrics.waterIntake ? prepareWaterData(filteredHealthLogs) : null
    };
    
    setReportContent(reportData);
    if (onGenerateReport) {
      onGenerateReport(reportData);
    }
    setLoading(false);
  };

  const getStartDate = (rangeOption) => {
    switch (rangeOption) {
      case '7d':
        return subDays(new Date(), 7);
      case '30d':
        return subDays(new Date(), 30);
      case '90d':
        return subDays(new Date(), 90);
      case '180d':
        return subDays(new Date(), 180);
      case '365d':
        return subDays(new Date(), 365);
      case 'custom':
        return new Date(reportConfig.customStartDate);
      default:
        return subDays(new Date(), 30);
    }
  };

  const prepareWeightData = (records) => {
    const weightRecords = records
      .filter(r => r.type === 'peso')
      .sort((a, b) => new Date(a.date) - new Date(b.date));
      
    const chartData = weightRecords.map(record => ({
      date: format(new Date(record.date), 'dd/MM'),
      peso: parseFloat(record.value)
    }));
    
    let weightTrend = 'stable';
    let trendPercentage = 0;
    
    if (weightRecords.length >= 2) {
      const firstRecord = weightRecords[0];
      const lastRecord = weightRecords[weightRecords.length - 1];
      
      const firstWeight = parseFloat(firstRecord.value);
      const lastWeight = parseFloat(lastRecord.value);
      
      if (lastWeight > firstWeight) {
        weightTrend = 'up';
        trendPercentage = ((lastWeight - firstWeight) / firstWeight) * 100;
      } else if (lastWeight < firstWeight) {
        weightTrend = 'down';
        trendPercentage = ((firstWeight - lastWeight) / firstWeight) * 100;
      }
    }
    
    return {
      records: weightRecords,
      chartData,
      trend: {
        direction: weightTrend,
        percentage: trendPercentage.toFixed(1)
      },
      current: weightRecords.length > 0 ? parseFloat(weightRecords[weightRecords.length - 1].value) : null,
      average: weightRecords.length > 0 
        ? (weightRecords.reduce((sum, r) => sum + parseFloat(r.value), 0) / weightRecords.length).toFixed(1) 
        : null
    };
  };

  const prepareActivityData = (healthLogs) => {
    const activityLogs = healthLogs
      .filter(log => log.activity_level || log.activity_minutes)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
      
    const chartData = activityLogs.map(log => ({
      date: format(new Date(log.date), 'dd/MM'),
      minutos: log.activity_minutes || 0
    }));
    
    const activityLevels = activityLogs.reduce((acc, log) => {
      const level = log.activity_level || 'não informado';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});
    
    const pieData = Object.keys(activityLevels).map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: activityLevels[key]
    }));
    
    const totalMinutes = activityLogs.reduce((sum, log) => sum + (log.activity_minutes || 0), 0);
    const avgMinutes = activityLogs.length > 0 ? totalMinutes / activityLogs.length : 0;
    
    return {
      logs: activityLogs,
      chartData,
      pieData,
      summary: {
        totalMinutes,
        avgMinutes: avgMinutes.toFixed(0),
        mostFrequentLevel: Object.entries(activityLevels).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
      }
    };
  };

  const prepareVaccinationData = (pet, records) => {
    const vaccinationRecords = records
      .filter(r => r.type === 'vacina')
      .sort((a, b) => new Date(b.date) - new Date(a.date));
      
    const petVaccinations = pet.vaccinations || [];
    
    return {
      records: vaccinationRecords,
      petVaccinations,
      upcoming: petVaccinations
        .filter(v => v.next_date && new Date(v.next_date) > new Date())
        .sort((a, b) => new Date(a.next_date) - new Date(b.next_date))
    };
  };

  const prepareMedicationData = (records, events) => {
    const medicationRecords = records
      .filter(r => r.type === 'medicamento')
      .sort((a, b) => new Date(b.date) - new Date(a.date));
      
    const medicationEvents = events
      .filter(e => e.type === 'medicamento')
      .sort((a, b) => new Date(b.date) - new Date(a.date));
      
    const petMedications = petData.pet.medications || [];
    
    return {
      records: medicationRecords,
      events: medicationEvents,
      petMedications,
      active: petMedications.filter(m => !m.end_date || new Date(m.end_date) >= new Date())
    };
  };

  const prepareVetVisitsData = (events) => {
    const vetVisits = events
      .filter(e => e.type === 'consulta')
      .sort((a, b) => new Date(b.date) - new Date(a.date));
      
    return {
      visits: vetVisits,
      upcoming: events
        .filter(e => e.type === 'consulta' && new Date(e.date) > new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
    };
  };

  const prepareSymptomsData = (healthLogs) => {
    const logsWithSymptoms = healthLogs
      .filter(log => log.symptoms && log.symptoms.length > 0)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
      
    const symptomCounts = {};
    logsWithSymptoms.forEach(log => {
      log.symptoms.forEach(symptom => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
      });
    });
    
    const chartData = Object.entries(symptomCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    return {
      logs: logsWithSymptoms,
      chartData
    };
  };

  const prepareFoodData = (healthLogs) => {
    const logsWithFood = healthLogs
      .filter(log => log.food_intake)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
      
    return {
      logs: logsWithFood
    };
  };

  const prepareWaterData = (healthLogs) => {
    const logsWithWater = healthLogs
      .filter(log => log.water_intake)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const waterLevels = logsWithWater.reduce((acc, log) => {
      const level = log.water_intake;
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});
    
    const chartData = Object.keys(waterLevels).map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: waterLevels[key]
    }));
    
    return {
      logs: logsWithWater,
      chartData,
      mostFrequent: Object.entries(waterLevels).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
        <p className="text-lg font-medium">Gerando relatório...</p>
        <p className="text-gray-500">Isso pode levar alguns segundos</p>
      </div>
    );
  }

  if (!reportContent) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FileBarChart className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-lg text-gray-500">
          Configure os parâmetros do relatório e clique em Gerar
        </p>
      </div>
    );
  }

  return (
    <div className="report-container" ref={reportRef}>
      <div className="report-header p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-center mb-2">
          Relatório de Saúde - {reportContent.pet.name}
        </h1>
        <p className="text-center text-gray-500 mb-4">
          Período: {reportContent.dateRange.start} - {reportContent.dateRange.end}
        </p>
        
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {reportConfig.metrics.weightData && (
            <Badge className="bg-blue-100 text-blue-800">Peso</Badge>
          )}
          {reportConfig.metrics.activityData && (
            <Badge className="bg-green-100 text-green-800">Atividade Física</Badge>
          )}
          {reportConfig.metrics.vaccinationHistory && (
            <Badge className="bg-red-100 text-red-800">Vacinas</Badge>
          )}
          {reportConfig.metrics.medicationHistory && (
            <Badge className="bg-purple-100 text-purple-800">Medicamentos</Badge>
          )}
          {reportConfig.metrics.veterinaryVisits && (
            <Badge className="bg-indigo-100 text-indigo-800">Consultas</Badge>
          )}
          {reportConfig.metrics.symptoms && (
            <Badge className="bg-amber-100 text-amber-800">Sintomas</Badge>
          )}
          {reportConfig.metrics.foodIntake && (
            <Badge className="bg-pink-100 text-pink-800">Alimentação</Badge>
          )}
          {reportConfig.metrics.waterIntake && (
            <Badge className="bg-cyan-100 text-cyan-800">Hidratação</Badge>
          )}
        </div>
        
        <div className="pet-info flex items-center justify-center gap-4">
          <img
            src={reportContent.pet.photo_url || "https://images.unsplash.com/photo-1560807707-8cc77767d783"}
            alt={reportContent.pet.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h2 className="text-lg font-semibold">{reportContent.pet.name}</h2>
            <p className="text-sm text-gray-600">
              {reportContent.pet.species === 'cachorro' ? 'Cão' : 
               reportContent.pet.species === 'gato' ? 'Gato' : 
               reportContent.pet.species}
              {reportContent.pet.breed ? ` • ${reportContent.pet.breed}` : ''}
              {reportContent.pet.birth_date ? 
                ` • ${format(new Date(reportContent.pet.birth_date), 'dd/MM/yyyy')}` : 
                ''}
            </p>
          </div>
        </div>
      </div>
      
      <div className="report-content p-6 space-y-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clipboard className="w-5 h-5 text-purple-600" />
              Resumo do Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportContent.weight && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-500">Peso atual</p>
                    <Badge className={
                      reportContent.weight.trend.direction === "up" ? "bg-amber-100 text-amber-800" :
                      reportContent.weight.trend.direction === "down" ? "bg-blue-100 text-blue-800" :
                      "bg-green-100 text-green-800"
                    }>
                      {reportContent.weight.trend.direction === "up" ? `↑ ${reportContent.weight.trend.percentage}%` :
                       reportContent.weight.trend.direction === "down" ? `↓ ${reportContent.weight.trend.percentage}%` : 
                       "→ Estável"}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold">{reportContent.weight.current} kg</p>
                  <p className="text-sm text-gray-500">Média: {reportContent.weight.average} kg</p>
                </div>
              )}
              
              {reportContent.activity && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Atividade Física</p>
                  <p className="text-2xl font-bold">{reportContent.activity.summary.totalMinutes} min</p>
                  <p className="text-sm text-gray-500">
                    Média diária: {reportContent.activity.summary.avgMinutes} min
                  </p>
                  <p className="text-sm text-gray-500">
                    Nível mais frequente: {reportContent.activity.summary.mostFrequentLevel}
                  </p>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {reportContent.vaccinations && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Syringe className="w-4 h-4 text-red-600" />
                    <p className="text-sm font-medium">Vacinas</p>
                  </div>
                  <p className="text-xl font-bold mt-1">
                    {reportContent.vaccinations.records.length + reportContent.vaccinations.petVaccinations.length} vacinas
                  </p>
                  <p className="text-sm text-gray-500">
                    {reportContent.vaccinations.upcoming.length} próximas doses
                  </p>
                </div>
              )}
              
              {reportContent.medications && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-purple-600" />
                    <p className="text-sm font-medium">Medicamentos</p>
                  </div>
                  <p className="text-xl font-bold mt-1">
                    {reportContent.medications.active.length} ativos
                  </p>
                  <p className="text-sm text-gray-500">
                    {reportContent.medications.records.length} registros no período
                  </p>
                </div>
              )}
              
              {reportContent.veterinaryVisits && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-indigo-600" />
                    <p className="text-sm font-medium">Consultas</p>
                  </div>
                  <p className="text-xl font-bold mt-1">
                    {reportContent.veterinaryVisits.visits.length} consultas
                  </p>
                  <p className="text-sm text-gray-500">
                    {reportContent.veterinaryVisits.upcoming.length} agendadas
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {reportContent.weight && reportContent.weight.records.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-600" />
                Evolução do Peso
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reportContent.weight.chartData.length > 1 ? (
                <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={reportContent.weight.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
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
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Dados insuficientes para gerar o gráfico de peso.
                  </AlertDescription>
                </Alert>
              )}
              
              <Separator className="my-4" />
              
              <h3 className="text-sm font-semibold mb-2">Registros de Peso</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {reportContent.weight.records.map((record, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                    <span>{format(new Date(record.date), 'dd/MM/yyyy')}</span>
                    <span className="font-semibold">{record.value} kg</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {reportContent.activity && reportContent.activity.logs.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                Atividade Física
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {reportContent.activity.chartData.length > 1 && (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportContent.activity.chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar 
                          dataKey="minutos" 
                          fill="#82ca9d" 
                          name="Minutos de atividade"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                
                {reportContent.activity.pieData.length > 1 && (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reportContent.activity.pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {reportContent.activity.pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
              
              <Separator className="my-4" />
              
              <h3 className="text-sm font-semibold mb-2">Registros de Atividade</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {reportContent.activity.logs.map((log, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                    <div>
                      <span>{format(new Date(log.date), 'dd/MM/yyyy')}</span>
                      {log.activity_level && (
                        <Badge className="ml-2 bg-green-100 text-green-800">
                          {log.activity_level}
                        </Badge>
                      )}
                    </div>
                    <span className="font-semibold">
                      {log.activity_minutes || 0} min
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {reportContent.vaccinations && (
          reportContent.vaccinations.records.length > 0 || 
          reportContent.vaccinations.petVaccinations.length > 0
        ) && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Syringe className="w-5 h-5 text-red-600" />
                Histórico de Vacinação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-sm font-semibold mb-2">Vacinas Administradas</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                {reportContent.vaccinations.records.map((record, idx) => (
                  <div key={idx} className="p-2 bg-gray-50 rounded-md">
                    <div className="flex justify-between">
                      <span className="font-semibold">{record.value}</span>
                      <span>{format(new Date(record.date), 'dd/MM/yyyy')}</span>
                    </div>
                    {record.notes && (
                      <p className="text-sm text-gray-600 mt-1">{record.notes}</p>
                    )}
                  </div>
                ))}
                
                {reportContent.vaccinations.petVaccinations.map((vacc, idx) => (
                  <div key={`pet-vacc-${idx}`} className="p-2 bg-gray-50 rounded-md">
                    <div className="flex justify-between">
                      <span className="font-semibold">{vacc.name}</span>
                      <span>{format(new Date(vacc.date), 'dd/MM/yyyy')}</span>
                    </div>
                    {vacc.next_date && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Próxima dose:</span>
                        <span>{format(new Date(vacc.next_date), 'dd/MM/yyyy')}</span>
                      </div>
                    )}
                    {vacc.notes && (
                      <p className="text-sm text-gray-600 mt-1">{vacc.notes}</p>
                    )}
                  </div>
                ))}
                
                {reportContent.vaccinations.records.length === 0 && 
                 reportContent.vaccinations.petVaccinations.length === 0 && (
                  <div className="text-center p-4 text-gray-500">
                    Nenhum registro de vacinação no período selecionado
                  </div>
                )}
              </div>
              
              {reportContent.vaccinations.upcoming.length > 0 && (
                <>
                  <h3 className="text-sm font-semibold mb-2">Próximas Vacinas</h3>
                  <div className="space-y-2">
                    {reportContent.vaccinations.upcoming.map((vacc, idx) => (
                      <div key={idx} className="p-2 bg-red-50 rounded-md border border-red-100">
                        <div className="flex justify-between">
                          <span className="font-semibold">{vacc.name}</span>
                          <span>{format(new Date(vacc.next_date), 'dd/MM/yyyy')}</span>
                        </div>
                        {vacc.notes && (
                          <p className="text-sm text-gray-600 mt-1">{vacc.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
        
        {reportContent.medications && (
          reportContent.medications.records.length > 0 || 
          reportContent.medications.active.length > 0
        ) && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-purple-600" />
                Medicamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reportContent.medications.active.length > 0 && (
                <>
                  <h3 className="text-sm font-semibold mb-2">Medicamentos Atuais</h3>
                  <div className="space-y-2 mb-4">
                    {reportContent.medications.active.map((med, idx) => (
                      <div key={idx} className="p-2 bg-purple-50 rounded-md border border-purple-100">
                        <div className="font-semibold">{med.name}</div>
                        <div className="text-sm">Dosagem: {med.dosage}</div>
                        <div className="text-sm">Frequência: {med.frequency}</div>
                        <div className="text-sm">
                          Início: {format(new Date(med.start_date), 'dd/MM/yyyy')}
                          {med.end_date && ` • Término: ${format(new Date(med.end_date), 'dd/MM/yyyy')}`}
                        </div>
                        {med.notes && (
                          <p className="text-sm text-gray-600 mt-1">{med.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              <h3 className="text-sm font-semibold mb-2">Histórico de Medicações</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {reportContent.medications.records.map((record, idx) => (
                  <div key={idx} className="p-2 bg-gray-50 rounded-md">
                    <div className="flex justify-between">
                      <span className="font-semibold">{record.value}</span>
                      <span>{format(new Date(record.date), 'dd/MM/yyyy')}</span>
                    </div>
                    {record.notes && (
                      <p className="text-sm text-gray-600 mt-1">{record.notes}</p>
                    )}
                  </div>
                ))}
                
                {reportContent.medications.events.map((event, idx) => (
                  <div key={`event-${idx}`} className="p-2 bg-gray-50 rounded-md">
                    <div className="flex justify-between">
                      <span className="font-semibold">{event.title}</span>
                      <span>{format(new Date(event.date), 'dd/MM/yyyy HH:mm')}</span>
                    </div>
                    {event.notes && (
                      <p className="text-sm text-gray-600 mt-1">{event.notes}</p>
                    )}
                  </div>
                ))}
                
                {reportContent.medications.records.length === 0 && 
                 reportContent.medications.events.length === 0 && (
                  <div className="text-center p-4 text-gray-500">
                    Nenhum registro de medicação no período selecionado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
      </div>
      
      <div className="report-actions p-6 bg-gray-50 sticky bottom-0 border-t flex flex-wrap justify-center gap-3">
        <Button 
          variant="outline" 
          onClick={onPrint}
          className="gap-2"
        >
          <Printer className="w-4 h-4" />
          Imprimir
        </Button>
        
        <Button 
          onClick={onExportPDF}
          className="bg-purple-700 hover:bg-purple-800 gap-2"
        >
          <Download className="w-4 h-4" />
          Exportar PDF
        </Button>
        
        <Button 
          variant="outline"
          onClick={onSendEmail}
          className="gap-2"
        >
          <Mail className="w-4 h-4" />
          Enviar por Email
        </Button>
      </div>
    </div>
  );
}
