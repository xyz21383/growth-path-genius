import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StudentProgress } from "@/data/sampleData";
import { 
  Calendar, 
  TrendingUp, 
  Award, 
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";

interface StudentCardProps {
  student: StudentProgress;
  onViewDetails: (studentId: string) => void;
}

export const StudentCard = ({ student, onViewDetails }: StudentCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-success';
      case 'in-progress':
        return 'bg-warning';
      default:
        return 'bg-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const completedTopics = student.topics.filter(topic => topic.status === 'done').length;
  const totalTopics = student.topics.length;

  return (
    <Card className="bg-gradient-card border-border/50 hover:shadow-elevation transition-all duration-300 hover:scale-[1.02] group">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
            {student.name}
          </CardTitle>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            <Award className="w-3 h-3 mr-1" />
            {student.streakDays} days
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-semibold text-foreground">{student.overallProgress}%</span>
          </div>
          <Progress 
            value={student.overallProgress} 
            className="h-2 bg-muted"
          />
        </div>

        {/* Topics Overview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Topics</span>
            <span className="text-sm font-medium">{completedTopics}/{totalTopics} Complete</span>
          </div>
          
          <div className="space-y-2">
            {student.topics.slice(0, 3).map((topic) => (
              <div key={topic.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(topic.status)}`} />
                <span className="text-sm text-foreground flex-1 truncate">{topic.title}</span>
                <div className="flex items-center gap-1 text-muted-foreground">
                  {getStatusIcon(topic.status)}
                </div>
              </div>
            ))}
            {student.topics.length > 3 && (
              <div className="text-xs text-muted-foreground text-center py-1">
                +{student.topics.length - 3} more topics
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Avg Score</p>
              <p className="text-sm font-semibold text-foreground">
                {Math.round(student.topics.reduce((acc, topic) => acc + (topic.quizScore || 0), 0) / student.topics.length) || 0}%
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Last Active</p>
              <p className="text-sm font-semibold text-foreground">
                {new Date(student.lastActivity).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          onClick={() => onViewDetails(student.id)}
          variant="outline" 
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};