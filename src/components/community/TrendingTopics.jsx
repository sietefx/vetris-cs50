import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Hash } from "lucide-react";

export default function TrendingTopics() {
  const trendingTopics = [
    { id: 1, name: "SaúdePet", count: 215 },
    { id: 2, name: "AdoçãoResponsável", count: 189 },
    { id: 3, name: "DicasNutrição", count: 142 },
    { id: 4, name: "PetsEmCasa", count: 98 },
    { id: 5, name: "TreinamentoCães", count: 87 }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-purple-600" />
          Tópicos em Alta
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {trendingTopics.map(topic => (
            <div key={topic.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-sm">{topic.name}</span>
              </div>
              <Badge variant="outline" className="text-xs">{topic.count} posts</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}