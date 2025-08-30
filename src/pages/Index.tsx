import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { StatsOverview } from "@/components/StatsOverview";
import { StudentCard } from "@/components/StudentCard";
import { StudentDetailsModal } from "@/components/StudentDetailsModal";
import { sampleStudents, StudentProgress } from "@/data/sampleData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Grid, List } from "lucide-react";

const Index = () => {
  const [students] = useState(sampleStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setSelectedStudent(student);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <DashboardHeader />
        
        {/* Stats Overview */}
        <StatsOverview students={students} />
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card border-border/50"
            />
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            
            <div className="flex rounded-lg border border-border/50 overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Students Grid */}
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1 max-w-4xl mx-auto'
        }`}>
          {filteredStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No students found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms or filters.</p>
          </div>
        )}

        {/* Student Details Modal */}
        <StudentDetailsModal 
          student={selectedStudent}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default Index;