import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { VEHICLE_MAKES, VEHICLE_YEARS } from "@/lib/constants";
import ImageUpload from "@/components/image-upload";

const searchSchema = z.object({
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.string().optional(),
  partName: z.string().min(1, "Part name is required"),
  imageUrl: z.string().optional(),
});

type SearchFormData = z.infer<typeof searchSchema>;

interface SearchFormProps {
  onSearch: (data: SearchFormData) => void;
  isLoading?: boolean;
}

export default function SearchForm({ onSearch, isLoading = false }: SearchFormProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      vehicleMake: "",
      vehicleModel: "",
      vehicleYear: "",
      partName: "",
      imageUrl: "",
    },
  });

  const handleSubmit = (data: SearchFormData) => {
    onSearch({
      ...data,
      imageUrl: uploadedImage || undefined,
    });
  };

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
  };

  return (
    <section className="search-section p-6 pb-8">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Find Your Spare Parts</h2>
          <p className="text-muted-foreground">Connect with verified sellers at Abossey Okai</p>
        </div>

        <div className="bg-card rounded-lg p-4 space-y-4 border border-border">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="vehicleMake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Make</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger 
                            className="w-full p-3 bg-input border border-border text-foreground"
                            data-testid="select-vehicle-make"
                          >
                            <SelectValue placeholder="Select Make" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {VEHICLE_MAKES.map((make) => (
                            <SelectItem key={make.value} value={make.value}>
                              {make.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicleYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Year</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger 
                            className="w-full p-3 bg-input border border-border text-foreground"
                            data-testid="select-vehicle-year"
                          >
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {VEHICLE_YEARS.map((year) => (
                            <SelectItem key={year.value} value={year.value}>
                              {year.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="vehicleModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Model</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter vehicle model"
                        className="w-full p-3 bg-input border border-border text-foreground placeholder-muted-foreground"
                        data-testid="input-vehicle-model"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="partName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Part Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Brake pad, Engine oil filter..."
                        className="w-full p-3 bg-input border border-border text-foreground placeholder-muted-foreground"
                        data-testid="input-part-name"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div>
                <label className="block text-sm font-medium mb-2">Upload Part Photo (Optional)</label>
                <ImageUpload onImageUpload={handleImageUpload} />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 transition-colors flex items-center justify-center space-x-2"
                data-testid="button-search"
              >
                <Search className="w-5 h-5" />
                <span>{isLoading ? "Searching..." : "Search Parts"}</span>
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
}
