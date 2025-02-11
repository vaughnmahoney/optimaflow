
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export function SidebarLogo() {
  const { toast } = useToast();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const storedLogo = localStorage.getItem("companyLogo");
    if (storedLogo) {
      setLogoUrl(storedLogo);
    }
  }, []);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoUrl(base64String);
        localStorage.setItem("companyLogo", base64String);
        toast({
          title: "Logo updated",
          description: "Your company logo has been updated successfully.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt="Company Logo"
          className="h-12 w-12 object-contain rounded"
        />
      ) : (
        <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center text-gray-400">
          Logo
        </div>
      )}
      <div className="relative w-full">
        <input
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Upload logo"
        />
        <button className="w-full text-sm text-gray-600 hover:text-gray-900 transition-colors">
          Upload Logo
        </button>
      </div>
    </div>
  );
}
