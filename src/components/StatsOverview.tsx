import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  TrendingUp, 
  Target, 
  Award,
  Clock,
  CheckCircle2
} from "lucide-react";
import { StudentProgress } from "@/data/sampleData";

interface StatsOverviewProps {
  students: StudentProgress[];
}

export const StatsOverview = ({ students }: StatsOverviewProps) => {
  const totalStudents = students.length;
  const avgProgress = Math.round(
    students.reduce((acc, student) => acc + student.overallProgress, 0) / totalStudents
  );
  const activeToday = students.filter(
    student => student.lastActivity === new Date().toISOString().split('T')[0]
  ).length;
  const avgStreak = Math.round(
    students.reduce((acc, student) => acc + student.streakDays, 0) / totalStudents
  );

  const completedTopics = students.reduce((acc, student) => 
    acc + student.topics.filter(topic => topic.status === 'done').length, 0
  );
  const totalTopics = students.reduce((acc, student) => acc + student.topics.length, 0);

  const stats = [
    {
      title: "Total Students",
      value: totalStudents,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Average Progress",
      value: `${avgProgress}%`,
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      title: "Active Today",
      value: activeToday,
      icon: Clock,
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      title: "Avg Streak",
      value: `${avgStreak} days`,
      icon: Award,
      color: "text-warning",
      bgColor: "bg-warning/10"
    },
    {
      title: "Topics Completed",
      value: `${completedTopics}/${totalTopics}`,
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      title: "Completion Rate",
      value: `${Math.round((completedTopics / totalTopics) * 100)}%`,
      icon: Target,
      color: "text-primary",
      bgColor: "bg-primary/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-gradient-card border-border/50 hover:shadow-card transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl font-bold text-foreground">
                  {stat.value}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {stat.title}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};