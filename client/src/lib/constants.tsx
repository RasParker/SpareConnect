export const VEHICLE_MAKES = [
  { value: "toyota", label: "Toyota" },
  { value: "honda", label: "Honda" },
  { value: "nissan", label: "Nissan" },
  { value: "hyundai", label: "Hyundai" },
  { value: "kia", label: "Kia" },
  { value: "volkswagen", label: "Volkswagen" },
  { value: "mazda", label: "Mazda" },
  { value: "mitsubishi", label: "Mitsubishi" },
  { value: "ford", label: "Ford" },
  { value: "chevrolet", label: "Chevrolet" },
];

export const VEHICLE_YEARS = Array.from({ length: 25 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { value: year.toString(), label: year.toString() };
});

export const AVAILABILITY_OPTIONS = [
  { value: "in_stock", label: "In Stock", color: "green" },
  { value: "low_stock", label: "Low Stock", color: "yellow" },
  { value: "out_of_stock", label: "Out of Stock", color: "red" },
];

export const USER_ROLES = [
  { value: "buyer", label: "Buyer" },
  { value: "dealer", label: "Dealer" },
  { value: "admin", label: "Admin" },
];

export const CONTACT_TYPES = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "call", label: "Phone Call" },
  { value: "profile_view", label: "Profile View" },
];
