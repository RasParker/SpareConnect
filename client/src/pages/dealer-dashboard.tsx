import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Edit, Trash2, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { AVAILABILITY_OPTIONS } from "@/lib/constants";
import ImageUpload from "@/components/image-upload";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import type { Seller, Part } from "@shared/schema";

const partSchema = z.object({
  name: z.string().min(1, "Part name is required"),
  description: z.string().optional(),
  price: z.string().optional(),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.string().optional(),
  availability: z.string(),
  imageUrl: z.string().optional(),
});

type PartFormData = z.infer<typeof partSchema>;

export default function DealerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);

  const { data: seller } = useQuery<Seller>({
    queryKey: ['/api/sellers/by-user', user?.id],
    enabled: !!user && user.role === 'seller',
    queryFn: async () => {
      const response = await fetch(`/api/sellers?userId=${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch seller');
      const sellers = await response.json();
      return sellers[0]; // Assuming one seller per user
    },
  });

  const { data: parts = [] } = useQuery<Part[]>({
    queryKey: ['/api/parts', seller?.id],
    enabled: !!seller,
  });

  const { data: contacts = [] } = useQuery<any[]>({
    queryKey: ['/api/contacts', seller?.id],
    enabled: !!seller,
  });

  const addPartMutation = useMutation({
    mutationFn: async (partData: PartFormData) => {
      const response = await fetch('/api/parts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...partData,
          sellerId: seller?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add part');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parts', seller?.id] });
      setIsAddPartDialogOpen(false);
      toast({
        title: "Part added",
        description: "Your part has been added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Failed to add part",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const updatePartMutation = useMutation({
    mutationFn: async ({ partId, data }: { partId: string; data: PartFormData }) => {
      const response = await fetch(`/api/parts/${partId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update part');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parts', seller?.id] });
      setEditingPart(null);
      toast({
        title: "Part updated",
        description: "Your part has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update part",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const deletePartMutation = useMutation({
    mutationFn: async (partId: string) => {
      const response = await fetch(`/api/parts/${partId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete part');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parts', seller?.id] });
      toast({
        title: "Part deleted",
        description: "Your part has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete part",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const form = useForm<PartFormData>({
    resolver: zodResolver(partSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleYear: "",
      availability: "in_stock",
      imageUrl: "",
    },
  });

  const handleAddPart = (data: PartFormData) => {
    addPartMutation.mutate(data);
  };

  const handleEditPart = (part: Part) => {
    setEditingPart(part);
    form.reset({
      name: part.name,
      description: part.description || "",
      price: part.price || "",
      vehicleMake: part.vehicleMake || "",
      vehicleModel: part.vehicleModel || "",
      vehicleYear: part.vehicleYear || "",
      availability: part.availability,
      imageUrl: part.imageUrl || "",
    });
  };

  const handleUpdatePart = (data: PartFormData) => {
    if (!editingPart) return;
    updatePartMutation.mutate({ partId: editingPart.id, data });
  };

  const handleDeletePart = (partId: string) => {
    if (confirm("Are you sure you want to delete this part?")) {
      deletePartMutation.mutate(partId);
    }
  };

  if (!user || user.role !== 'seller') {
    return (
      <div className="dark bg-background text-foreground min-h-screen">
        <div className="app-container flex items-center justify-center min-h-screen">
          <p className="text-center">Access denied. Seller account required.</p>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="dark bg-background text-foreground min-h-screen">
        <div className="app-container flex items-center justify-center min-h-screen">
          <p className="text-center">Loading seller information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dark bg-background text-foreground min-h-screen">
      <div className="app-container">
        <Header />

        {/* Dealer Header */}
        <div className="bg-card p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Seller Dashboard</h2>
              <p className="text-sm text-muted-foreground" data-testid="text-seller-name">
                {seller.shopName}
              </p>
            </div>
            <Dialog open={isAddPartDialogOpen} onOpenChange={setIsAddPartDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  data-testid="button-add-part"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Part
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Add New Part</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleAddPart)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Part Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Brake Pad Set" />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Part description..." />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (₵)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.01" placeholder="0.00" />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-3">
                      <FormField
                        control={form.control}
                        name="vehicleMake"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Make</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Toyota" />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="vehicleModel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Model</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Camry" />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="vehicleYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="2020-2023" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="availability"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Availability</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {AVAILABILITY_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <div>
                      <FormLabel>Part Image</FormLabel>
                      <ImageUpload 
                        onImageUpload={(url) => form.setValue('imageUrl', url)} 
                        existingImageUrl={form.watch('imageUrl')}
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        type="submit" 
                        disabled={addPartMutation.isPending}
                        className="flex-1"
                      >
                        {addPartMutation.isPending ? "Adding..." : "Add Part"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsAddPartDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="p-4 grid grid-cols-2 gap-4">
          <Card className="bg-card border-border text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary" data-testid="text-parts-count">
                {parts.length}
              </div>
              <div className="text-sm text-muted-foreground">Parts Listed</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary" data-testid="text-contacts-count">
                {contacts.length}
              </div>
              <div className="text-sm text-muted-foreground">This Month's Contacts</div>
            </CardContent>
          </Card>
        </div>

        {/* Parts Management */}
        <div className="p-4">
          <h3 className="font-semibold mb-4">Manage Your Parts</h3>
          <div className="space-y-3">
            {parts.length > 0 ? (
              parts.map((part) => (
                <Card key={part.id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {part.imageUrl ? (
                          <img 
                            src={part.imageUrl} 
                            alt={part.name}
                            className="w-12 h-12 rounded object-cover" 
                          />
                        ) : (
                          <div className="w-12 h-12 bg-primary/20 rounded flex items-center justify-center">
                            <Store className="w-6 h-6 text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium" data-testid={`text-part-name-${part.id}`}>
                            {part.name}
                          </p>
                          <p className="text-sm text-muted-foreground" data-testid={`text-part-info-${part.id}`}>
                            {part.price ? `₵${part.price}` : "Price not set"} • 
                            {AVAILABILITY_OPTIONS.find(opt => opt.value === part.availability)?.label}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditPart(part)}
                          data-testid={`button-edit-${part.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeletePart(part.id)}
                          className="text-destructive hover:text-destructive"
                          data-testid={`button-delete-${part.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="p-8 text-center">
                  <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No parts listed yet</p>
                  <p className="text-sm text-muted-foreground mb-4">Add your first part to get started</p>
                  <Button onClick={() => setIsAddPartDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Part
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Edit Part Dialog */}
        <Dialog open={!!editingPart} onOpenChange={() => setEditingPart(null)}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Edit Part</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleUpdatePart)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Part Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Brake Pad Set" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Part description..." />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (₵)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="0.00" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name="vehicleMake"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Make</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Toyota" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicleModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Camry" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicleYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="2020-2023" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Availability</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AVAILABILITY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Part Image</FormLabel>
                  <ImageUpload 
                    onImageUpload={(url) => form.setValue('imageUrl', url)} 
                    existingImageUrl={form.watch('imageUrl')}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button 
                    type="submit" 
                    disabled={updatePartMutation.isPending}
                    className="flex-1"
                  >
                    {updatePartMutation.isPending ? "Updating..." : "Update Part"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setEditingPart(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <div className="h-20" />
        <BottomNav />
      </div>
    </div>
  );
}
