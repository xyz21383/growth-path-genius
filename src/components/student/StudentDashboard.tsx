import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Student, LearningRecord, AttendanceRecord, AIInsight } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Calendar, BookOpen, Target, TrendingUp, Zap, Clock, Award } from 'lucide-react'
import { format } from 'date-fns'

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [student, setStudent] = useState<Student | null>(null)
  const [learningRecords, setLearningRecords] = useState<LearningRecord[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingInsights, setGeneratingInsights] = useState(false)

  useEffect(() => {
    if (user) {
      fetchStudentData()
    }
  }, [user])

  const fetchStudentData = async () => {
    if (!user) return

    try {
      // Fetch student record
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (studentError) throw studentError
      setStudent(studentData)

      // Fetch learning records
      const { data: learningData, error: learningError } = await supabase
        .from('learning_records')
        .select('*')
        .eq('student_id', studentData.id)
        .order('created_at', { ascending: false })

      if (learningError) throw learningError
      setLearningRecords(learningData || [])

      // Fetch attendance records
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('student_id', studentData.id)
        .order('date', { ascending: false })
        .limit(30)

      if (attendanceError) throw attendanceError
      setAttendanceRecords(attendanceData || [])

      // Fetch AI insights
      const { data: insightsData, error: insightsError } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('student_id', studentData.id)
        .order('generated_at', { ascending: false })
        .limit(5)

      if (insightsError) throw insightsError
      setAiInsights(insightsData || [])

    } catch (error) {
      console.error('Error fetching student data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load your data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const generateAIInsights = async () => {
    if (!student) return

    setGeneratingInsights(true)
    try {
      const { data, error } = await supabase.functions.invoke('groq-insights', {
        body: {
          studentId: student.id,
          learningRecords,
          attendanceRecords,
        },
      })

      if (error) throw error

      // Refresh insights
      await fetchStudentData()
      
      toast({
        title: 'AI Insights Generated',
        description: 'New personalized insights have been generated for you!',
      })
    } catch (error) {
      console.error('Error generating insights:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate AI insights',
        variant: 'destructive',
      })
    } finally {
      setGeneratingInsights(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  if (!student) {
    return <div className="text-center text-muted-foreground">No student record found</div>
  }

  const completedTopics = learningRecords.filter(record => record.status === 'completed').length
  const totalTopics = learningRecords.length
  const recentAttendance = attendanceRecords.slice(0, 7)
  const attendanceRate = recentAttendance.length > 0 
    ? (recentAttendance.filter(a => a.status === 'present').length / recentAttendance.length) * 100 
    : 0

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.full_name}!</h1>
          <p className="text-muted-foreground">Track your learning progress and achievements</p>
        </div>
        <Button 
          onClick={generateAIInsights} 
          disabled={generatingInsights}
          variant="hero"
          className="flex items-center gap-2"
        >
          <Zap className="h-4 w-4" />
          {generatingInsights ? 'Generating...' : 'Get AI Insights'}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.overall_progress}%</div>
            <Progress value={student.overall_progress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Topics Completed</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTopics}/{totalTopics}</div>
            <p className="text-xs text-muted-foreground">
              {totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.streak_days}</div>
            <p className="text-xs text-muted-foreground">days in a row</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(attendanceRate)}%</div>
            <p className="text-xs text-muted-foreground">last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Content */}
      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList>
          <TabsTrigger value="progress">Learning Progress</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Learning Activities</CardTitle>
              <CardDescription>Your latest learning progress and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {learningRecords.slice(0, 5).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{record.topic}</h4>
                      <p className="text-sm text-muted-foreground">
                        Learning Date: {format(new Date(record.learning_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        record.status === 'completed' ? 'default' :
                        record.status === 'in-progress' ? 'secondary' : 'outline'
                      }>
                        {record.status}
                      </Badge>
                      {record.quiz_score && (
                        <Badge variant="outline">{record.quiz_score}%</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>Your attendance record for the past month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {attendanceRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(record.date), 'MMM dd, yyyy')}</span>
                    </div>
                    <Badge variant={
                      record.status === 'present' ? 'default' :
                      record.status === 'late' ? 'secondary' : 'destructive'
                    }>
                      {record.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                AI-Powered Insights
              </CardTitle>
              <CardDescription>
                Personalized recommendations and insights about your learning journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              {aiInsights.length > 0 ? (
                <div className="space-y-4">
                  {aiInsights.map((insight) => (
                    <div key={insight.id} className="p-4 border rounded-lg bg-gradient-to-r from-primary/5 to-accent/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="capitalize">
                          {insight.insight_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(insight.generated_at), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <p className="text-sm">{insight.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No AI insights generated yet. Click the "Get AI Insights" button to generate personalized recommendations!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}