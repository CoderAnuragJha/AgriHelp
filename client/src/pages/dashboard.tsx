import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Crop } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Thermometer, 
  Cloud, 
  Wind, 
  Sun,
  Calendar,
  Sprout,
  AlertTriangle
} from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Mock weather data
const weatherData = {
  temperature: "24°C",
  humidity: "65%",
  windSpeed: "12 km/h",
  condition: "Sunny",
};

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'growing':
      return 'bg-green-100 text-green-800';
    case 'ready':
      return 'bg-blue-100 text-blue-800';
    case 'harvested':
      return 'bg-purple-100 text-purple-800';
    case 'problem':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getDaysUntilHarvest(expectedHarvestDate: Date) {
  const today = new Date();
  const harvest = new Date(expectedHarvestDate);
  const diffTime = harvest.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Crops Overview</CardTitle>
            <Link href="/crops">
              <Button variant="outline" size="sm">
                <Sprout className="h-4 w-4 mr-2" />
                Manage Crops
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {crops?.map((crop) => {
                const daysUntilHarvest = getDaysUntilHarvest(crop.expectedHarvestDate);
                return (
                  <div
                    key={crop.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg space-y-4 sm:space-y-0 hover:bg-accent/5 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{crop.name}</h3>
                        <Badge variant="secondary" className={cn(getStatusColor(crop.status))}>
                          {crop.status}
                        </Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Planted: {new Date(crop.plantedDate).toLocaleDateString()}
                        </div>
                        <div className="hidden sm:block">•</div>
                        <div className="flex items-center gap-1">
                          <Sprout className="h-4 w-4" />
                          Quantity: {crop.quantity} units
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          Harvest in: {daysUntilHarvest} days
                        </span>
                        {daysUntilHarvest <= 7 && (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="w-full sm:w-[200px] h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${Math.max(0, Math.min(100, (1 - daysUntilHarvest / 90) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
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