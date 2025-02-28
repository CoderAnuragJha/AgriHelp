import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Crop } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Thermometer, Cloud, Wind, Sun } from "lucide-react";
import { Link } from "wouter";

// Mock weather data
const weatherData = {
  temperature: "24°C",
  humidity: "65%",
  windSpeed: "12 km/h",
  condition: "Sunny",
};

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: crops, isLoading } = useQuery<Crop[]>({
    queryKey: ["/api/crops"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10 bg-primary">
                <span className="font-semibold text-primary-foreground">
                  {user?.username.charAt(0).toUpperCase()}
                </span>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">Welcome to AgriHelp</h1>
                <p className="text-muted-foreground">Farm Dashboard</p>
              </div>
            </div>
            <nav className="flex w-full sm:w-auto gap-2">
              <Link href="/inventory">
                <Button variant="outline" className="flex-1 sm:flex-none">Inventory</Button>
              </Link>
              <Link href="/tasks">
                <Button variant="outline" className="flex-1 sm:flex-none">Tasks</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Weather Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-8">
          <Card className="touch-manipulation">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temperature</CardTitle>
              <Thermometer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{weatherData.temperature}</div>
            </CardContent>
          </Card>
          <Card className="touch-manipulation">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Humidity</CardTitle>
              <Cloud className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{weatherData.humidity}</div>
            </CardContent>
          </Card>
          <Card className="touch-manipulation">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wind Speed</CardTitle>
              <Wind className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{weatherData.windSpeed}</div>
            </CardContent>
          </Card>
          <Card className="touch-manipulation">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Condition</CardTitle>
              <Sun className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{weatherData.condition}</div>
            </CardContent>
          </Card>
        </div>

        {/* Crops Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Crops Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {crops?.map((crop) => (
                <div
                  key={crop.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg space-y-2 sm:space-y-0"
                >
                  <div>
                    <h3 className="font-semibold">{crop.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Planted: {new Date(crop.plantedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-medium">{crop.quantity} units</p>
                    <p className="text-sm text-muted-foreground">{crop.status}</p>
                  </div>
                </div>
              ))}
              {(!crops || crops.length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  No crops found. Start by adding some crops to your farm.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}