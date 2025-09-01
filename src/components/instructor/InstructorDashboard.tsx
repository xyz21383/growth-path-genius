import React, { useState, useEffect } from 'react'
import { supabase, Student, LearningRecord, AttendanceRecord, AIInsight } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Download, Search, Users, BookOpen, Calendar, TrendingUp, Filter } from 'lucide-react'
import { format } from 'date-fns'

interface StudentWithUser {
  id: string
  user_id: string
  student_number: string
  enrollment_date: string
  status: string
  overall_progress: number
  streak_days: number
  last_activity: string
  users: {
    full_name: string
    email: string
  }
  learning_records_count: number
  attendance_rate: number
}

export const InstructorDashboard: React.FC = () => {
  const { toast } = useToast()
  const [students, setStudents] = useState<StudentWithUser[]>([])
  const [filteredStudents, setFilteredStudents] = useState<StudentWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [progressFilter, setProgressFilter] = useState('all')

  // Stats
  const [totalStudents, setTotalStudents] = useState(0)
  const [averageProgress, setAverageProgress] = useState(0)
  const [activeStudents, setActiveStudents] = useState(0)
  const [topPerformers, setTopPerformers] = useState(0)

  useEffect(() => {
    fetchStudentsData()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [students, searchTerm, statusFilter, progressFilter])

  const fetchStudentsData = async () => {
    try {
      // Fetch students with user data
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          *,
          users!students_user_id_fkey (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (studentsError) throw studentsError

      // Enhance with learning records count and attendance rate
      const enhancedStudents = await Promise.all(
        (studentsData || []).map(async (student) => {
          // Get learning records count
          const { count: learningCount } = await supabase
            .from('learning_records')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', student.id)

          // Get attendance rate (last 30 days)
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          
          const { data: attendanceData } = await supabase
            .from('attendance_records')
            .select('status')
            .eq('student_id', student.id)
            .gte('date', thirtyDaysAgo.toISOString().split('T')[0])

          const attendanceRate = attendanceData 
            ? (attendanceData.filter(a => a.status === 'present').length / Math.max(attendanceData.length, 1)) * 100
            : 0

          return {
            ...student,
            learning_records_count: learningCount || 0,
            attendance_rate: Math.round(attendanceRate),
          }
        })
      )

      setStudents(enhancedStudents)
      calculateStats(enhancedStudents)

    } catch (error) {
      console.error('Error fetching students data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load students data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (studentsData: StudentWithUser[]) => {
    const total = studentsData.length
    const avgProgress = total > 0 
      ? Math.round(studentsData.reduce((sum, student) => sum + student.overall_progress, 0) / total)
      : 0
    
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const active = studentsData.filter(student => 
      new Date(student.last_activity) >= sevenDaysAgo
    ).length

    const topPerf = studentsData.filter(student => student.overall_progress >= 80).length

    setTotalStudents(total)
    setAverageProgress(avgProgress)
    setActiveStudents(active)
    setTopPerformers(topPerf)
  }

  const filterStudents = () => {
    let filtered = students

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.users.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.users.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_number.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => student.status === statusFilter)
    }

    // Progress filter
    if (progressFilter !== 'all') {
      switch (progressFilter) {
        case 'low':
          filtered = filtered.filter(student => student.overall_progress < 40)
          break
        case 'medium':
          filtered = filtered.filter(student => student.overall_progress >= 40 && student.overall_progress < 80)
          break
        case 'high':
          filtered = filtered.filter(student => student.overall_progress >= 80)
          break
      }
    }

    setFilteredStudents(filtered)
  }

  const exportData = async () => {
    try {
      // Prepare CSV data
      const csvData = filteredStudents.map(student => ({
        'Student Number': student.student_number,
        'Full Name': student.users.full_name,
        'Email': student.users.email,
        'Status': student.status,
        'Overall Progress': `${student.overall_progress}%`,
        'Streak Days': student.streak_days,
        'Learning Records': student.learning_records_count,
        'Attendance Rate': `${student.attendance_rate}%`,
        'Last Activity': student.last_activity,
        'Enrollment Date': student.enrollment_date,
      }))

      // Convert to CSV
      const headers = Object.keys(csvData[0] || {})
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
      ].join('\n')

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `students-report-${format(new Date(), 'yyyy-MM-dd')}.csv`
      a.click()
      URL.revokeObjectURL(url)

      toast({
        title: 'Export Successful',
        description: 'Students data has been exported to CSV',
      })
    } catch (error) {
      console.error('Error exporting data:', error)
      toast({
        title: 'Export Failed',
        description: 'Failed to export students data',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
          <p className="text-muted-foreground">Monitor student progress and performance</p>
        </div>
        <Button onClick={exportData} variant="hero" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">enrolled students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageProgress}%</div>
            <p className="text-xs text-muted-foreground">class average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeStudents}</div>
            <p className="text-xs text-muted-foreground">active this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topPerformers}</div>
            <p className="text-xs text-muted-foreground">80%+ progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or student number"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Progress Level</label>
              <Select value={progressFilter} onValueChange={setProgressFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="low">Low (0-39%)</SelectItem>
                  <SelectItem value="medium">Medium (40-79%)</SelectItem>
                  <SelectItem value="high">High (80-100%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setProgressFilter('all')
                }}
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Students Overview ({filteredStudents.length})</CardTitle>
          <CardDescription>Detailed view of all students and their progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Student</th>
                  <th className="text-left p-4 font-medium">Progress</th>
                  <th className="text-left p-4 font-medium">Streak</th>
                  <th className="text-left p-4 font-medium">Learning Records</th>
                  <th className="text-left p-4 font-medium">Attendance</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{student.users.full_name}</div>
                        <div className="text-sm text-muted-foreground">{student.users.email}</div>
                        <div className="text-xs text-muted-foreground">{student.student_number}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all"
                            style={{ width: `${student.overall_progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{student.overall_progress}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">
                        {student.streak_days} days
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">{student.learning_records_count} records</span>
                    </td>
                    <td className="p-4">
                      <Badge variant={student.attendance_rate >= 80 ? 'default' : student.attendance_rate >= 60 ? 'secondary' : 'destructive'}>
                        {student.attendance_rate}%
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                        {student.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(student.last_activity), 'MMM dd, yyyy')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}