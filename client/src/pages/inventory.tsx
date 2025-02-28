import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Inventory, insertInventorySchema } from "@shared/schema";
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
import { Loader2, Plus } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";

const categories = ["Seeds", "Fertilizer", "Tools", "Equipment", "Other"];

export default function InventoryPage() {
  const { user } = useAuth();
  const form = useForm({
    resolver: zodResolver(insertInventorySchema),
    defaultValues: {
      name: "",
      category: "Other",
      quantity: 0,
      unit: "units",
    },
  });

  const { data: inventory, isLoading } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  });

  const addInventoryMutation = useMutation({
    mutationFn: async (data: typeof form.getValues) => {
      const res = await apiRequest("POST", "/api/inventory", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
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
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Inventory Management</h1>
            <p className="text-muted-foreground">Track your farming supplies</p>
          </div>
          <nav className="flex gap-4">
            <Link href="/">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Link href="/tasks">
              <Button variant="outline">Tasks</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-6">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Inventory Item</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={form.handleSubmit((data) =>
                  addInventoryMutation.mutate(data)
                )}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input {...form.register("name")} />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue("category", value)
                    }
                    defaultValue={form.getValues("category")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    type="number"
                    {...form.register("quantity", { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input {...form.register("unit")} />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={addInventoryMutation.isPending}
                >
                  {addInventoryMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Item
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {inventory?.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle>{item.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Category:</span> {item.category}
                  </p>
                  <p>
                    <span className="font-medium">Quantity:</span> {item.quantity}{" "}
                    {item.unit}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!inventory || inventory.length === 0) && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                No inventory items found. Add some items to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
