import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, TrendingUp } from "lucide-react";

export const DashboardHeader = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-hero rounded-xl p-8 mb-8 shadow-glow">
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Growth Path Genius
            </h1>
            <p className="text-lg text-foreground/80 mb-4">
              Track student progress and unlock learning potential
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="text-sm">
                <Users className="w-4 h-4 mr-2" />
                50 Active Students
              </Badge>
              <Badge variant="secondary" className="text-sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                85% Avg Progress
              </Badge>
              <Badge variant="secondary" className="text-sm">
                <Calendar className="w-4 h-4 mr-2" />
                Current Week
              </Badge>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="hero" className="shadow-elevation">
              Add New Student
            </Button>
            <Button variant="secondary">
              Export Report
            </Button>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-accent opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
    </div>
  );
};