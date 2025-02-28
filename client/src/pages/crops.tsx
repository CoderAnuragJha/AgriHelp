import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Crop, insertCropSchema } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Calendar } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const cropStatuses = ["Growing", "Ready", "Harvested", "Problem"];

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

export default function CropsPage() {
  const { user } = useAuth();
  const form = useForm({
    resolver: zodResolver(insertCropSchema),
    defaultValues: {
      name: "",
      quantity: 0,
      plantedDate: new Date().toISOString().split("T")[0],
      expectedHarvestDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Growing",
    },
  });

  const { data: crops, isLoading } = useQuery<Crop[]>({
    queryKey: ["/api/crops"],
  });

  const addCropMutation = useMutation({
    mutationFn: async (data: typeof form.getValues) => {
      const res = await apiRequest("POST", "/api/crops", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crops"] });
      form.reset();
    },
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
            <div>
              <h1 className="text-2xl font-bold">Crop Management</h1>
              <p className="text-muted-foreground">Monitor and manage your crops</p>
            </div>
            <nav className="flex w-full sm:w-auto gap-2">
              <Link href="/">
                <Button variant="outline" className="flex-1 sm:flex-none">Dashboard</Button>
              </Link>
              <Link href="/inventory">
                <Button variant="outline" className="flex-1 sm:flex-none">Inventory</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-6">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Crop
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Crop</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={form.handleSubmit((data) =>
                  addCropMutation.mutate(data)
                )}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="name">Crop Name</Label>
                  <Input {...form.register("name")} />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    type="number"
                    {...form.register("quantity", { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <Label htmlFor="plantedDate">Planting Date</Label>
                  <Input
                    type="date"
                    {...form.register("plantedDate")}
                  />
                </div>
                <div>
                  <Label htmlFor="expectedHarvestDate">Expected Harvest Date</Label>
                  <Input
                    type="date"
                    {...form.register("expectedHarvestDate")}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue("status", value)
                    }
                    defaultValue={form.getValues("status")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {cropStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={addCropMutation.isPending}
                >
                  {addCropMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Crop
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {crops?.map((crop) => (
            <Card key={crop.id} className="touch-manipulation">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle>{crop.name}</CardTitle>
                    <Badge variant="secondary" className={cn(getStatusColor(crop.status))}>
                      {crop.status}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm">
                    Update Status
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>Planted: {new Date(crop.plantedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>Expected Harvest: {new Date(crop.expectedHarvestDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Quantity: {crop.quantity} units</p>
                    {/* Add more crop details here */}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {(!crops || crops.length === 0) && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  No crops found. Start by adding some crops to your farm.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
