import { AppSidebar } from "@/components/app-sidebar";
import { BarChartComponent } from "@/components/bar-chart";
import { CameraSection } from "@/components/camera-section";
import { LineChartComponent } from "@/components/lline-chart";
import { RadarChartComponent } from "@/components/radar-chart";
import { RadialChartComponent } from "@/components/radial-chart";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">데이터 분석</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="grid grid-cols-4 gap-4 p-4">
          <div className="col-span-2 row-span-5 rounded-xl bg-muted/50 flex items-center justify-center"> <CameraSection /> </div>

          <div className="col-span-1 row-span-2 rounded-xl bg-muted/50"> <LineChartComponent /> </div>
          <div className="col-span-1 row-span-2 rounded-xl bg-muted/50"> <BarChartComponent /> </div>

          <div className="col-span-1 row-span-2 rounded-xl bg-muted/50"> <RadarChartComponent /></div>
          <div className="col-span-1 row-span-2 rounded-xl bg-muted/50"> <RadialChartComponent /></div>

          <div className="col-span-1 row-span-2 rounded-xl bg-muted/50 h-64 text-center"> Foot Sensor Data1 </div>
          <div className="col-span-1 row-span-2 rounded-xl bg-muted/50 h-64 text-center"> Foot Sensor Data2 </div>

          <div className="col-span-2 row-span-1 rounded-xl bg-muted/50 h-24"> </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
