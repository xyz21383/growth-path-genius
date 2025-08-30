import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentProgress } from "@/data/sampleData";
import { 
  Calendar, 
  TrendingUp, 
  Award, 
  CheckCircle2,
  Clock,
  AlertCircle,
  Brain,
  Target,
  BookOpen
} from "lucide-react";

interface StudentDetailsModalProps {
  student: StudentProgress | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StudentDetailsModal = ({ student, isOpen, onClose }: StudentDetailsModalProps) => {
  if (!student) return null;

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
  const avgScore = Math.round(student.topics.reduce((acc, topic) => acc + (topic.quizScore || 0), 0) / student.topics.length) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            {student.name}
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <Award className="w-3 h-3 mr-1" />
              {student.streakDays} day streak
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="topics">Topics</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Overall Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{student.overallProgress}%</div>
                  <Progress value={student.overallProgress} className="mt-2 h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-accent" />
                    Topics Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{completedTopics}/{totalTopics}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {Math.round((completedTopics / totalTopics) * 100)}% completion rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    Average Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{avgScore}%</div>
                  <p className="text-sm text-muted-foreground mt-1">Across all quizzes</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Last active: {new Date(student.lastActivity).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="topics" className="space-y-4">
            <div className="space-y-4">
              {student.topics.map((topic) => (
                <Card key={topic.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{topic.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(topic.status)}`} />
                        {getStatusIcon(topic.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Learning Date:</span>
                        <p className="font-medium">{new Date(topic.learningDate).toLocaleDateString()}</p>
                      </div>
                      {topic.demoDate && (
                        <div>
                          <span className="text-muted-foreground">Demo Date:</span>
                          <p className="font-medium">{new Date(topic.demoDate).toLocaleDateString()}</p>
                        </div>
                      )}
                      {topic.quizScore && (
                        <div>
                          <span className="text-muted-foreground">Quiz Score:</span>
                          <p className="font-medium">{topic.quizScore}%</p>
                        </div>
                      )}
                      {topic.xmpTopic && (
                        <div>
                          <span className="text-muted-foreground">XMP Topic:</span>
                          <p className="font-medium">{topic.xmpTopic}</p>
                        </div>
                      )}
                    </div>
                    
                    {topic.xmpAssignment && (
                      <div className="pt-2 border-t border-border/50">
                        <span className="text-muted-foreground text-sm">Assignment:</span>
                        <p className="font-medium">{topic.xmpAssignment}</p>
                        {topic.xmpStatus && (
                          <Badge variant={topic.xmpStatus === 'completed' ? 'default' : 'secondary'} className="mt-1">
                            {topic.xmpStatus}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-muted-foreground text-center">
                    🤖 AI-powered insights and recommendations will be available once you connect to Supabase and integrate your Groq API key.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Completion Rate</span>
                      <span className="font-semibold">{Math.round((completedTopics / totalTopics) * 100)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Average Quiz Score</span>
                      <span className="font-semibold">{avgScore}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Current Streak</span>
                      <span className="font-semibold">{student.streakDays} days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Learning Pattern</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Topics in Progress</span>
                      <span className="font-semibold">
                        {student.topics.filter(t => t.status === 'in-progress').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Completed Topics</span>
                      <span className="font-semibold">{completedTopics}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Pending Topics</span>
                      <span className="font-semibold">
                        {student.topics.filter(t => t.status === 'not-started').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};