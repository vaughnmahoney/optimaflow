
import { Layout } from "@/components/Layout";
import { MRHeader } from "@/components/materials/MRHeader";
import { MRDateSelector } from "@/components/materials/MRDateSelector";
import { MRDriversTable } from "@/components/materials/MRDriversTable";
import { MRDriverDetail } from "@/components/materials/MRDriverDetail";
import { useMaterialRoutes } from "@/hooks/materials/useMaterialRoutes";
import { useState } from "react";
import { DriverRoute } from "@/services/optimoroute/getRoutesService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MRUploader } from "@/components/materials/MRUploader";
import { Card } from "@/components/ui/card";
import { MRContent } from "@/components/materials/MRContent";
import { useMRStore } from "@/hooks/materials/useMRStore";

export default function MaterialsRequirement() {
  const [selectedDriver, setSelectedDriver] = useState<DriverRoute | null>(null);
  const [activeTab, setActiveTab] = useState<string>("routes");
  const materialRoutes = useMaterialRoutes();
  const { materialsData } = useMRStore();
  
  const handleSelectDriver = (driver: DriverRoute | null) => {
    setSelectedDriver(driver);
  };

  return (
    <Layout title="Materials Requirement Generator">
      <div className="container py-6 space-y-6">
        <MRHeader />
        
        <Tabs defaultValue="routes" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
            <TabsTrigger value="routes">From Routes</TabsTrigger>
            <TabsTrigger value="excel">Upload Excel</TabsTrigger>
          </TabsList>
          
          <TabsContent value="routes" className="space-y-6">
            <MRDateSelector 
              onFetchRoutes={materialRoutes.fetchRouteMaterials}
              onReset={() => {
                materialRoutes.reset();
                setSelectedDriver(null);
              }}
              isLoading={materialRoutes.isLoading}
              batchStats={materialRoutes.batchStats}
            />
            
            {materialRoutes.routes.length > 0 && !selectedDriver && (
              <MRDriversTable 
                routes={materialRoutes.routes}
                onSelectDriver={handleSelectDriver}
              />
            )}
            
            {selectedDriver && (
              <MRDriverDetail 
                driver={selectedDriver}
                orderDetails={materialRoutes.orderDetails}
                onBack={() => setSelectedDriver(null)}
              />
            )}
          </TabsContent>
          
          <TabsContent value="excel">
            <Card className="p-6">
              <MRUploader />
              
              {materialsData.length > 0 && (
                <div className="mt-6">
                  <MRContent />
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
