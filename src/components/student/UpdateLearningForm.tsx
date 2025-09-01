import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Student, LearningRecord } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Calendar, BookOpen, CheckCircle, Plus } from 'lucide-react'
import { format } from 'date-fns'

export const UpdateLearningForm: React.FC = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [student, setStudent] = useState<Student | null>(null)
  const [learningRecords, setLearningRecords] = useState<LearningRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form states
  const [selectedRecord, setSelectedRecord] = useState<string>('')
  const [newTopic, setNewTopic] = useState('')
  const [status, setStatus] = useState<'not-started' | 'in-progress' | 'completed'>('not-started')
  const [learningDate, setLearningDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [demoDate, setDemoDate] = useState('')
  const [demoStatus, setDemoStatus] = useState<'pending' | 'completed' | 'yes-to-do'>('pending')
  const [quizScore, setQuizScore] = useState('')
  const [xmpTopic, setXmpTopic] = useState('')
  const [xmpAssignment, setXmpAssignment] = useState('')
  const [xmpStatus, setXmpStatus] = useState<'pending' | 'completed'>('pending')
  const [notes, setNotes] = useState('')
  const [attendanceStatus, setAttendanceStatus] = useState<'present' | 'absent' | 'late'>('present')
  const [attendanceNotes, setAttendanceNotes] = useState('')

  useEffect(() => {
    if (user) {
      fetchStudentData()
    }
  }, [user])

  const fetchStudentData = async () => {
    if (!user) return

    try {
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (studentError) throw studentError
      setStudent(studentData)

      const { data: recordsData, error: recordsError } = await supabase
        .from('learning_records')
        .select('*')
        .eq('student_id', studentData.id)
        .order('created_at', { ascending: false })

      if (recordsError) throw recordsError
      setLearningRecords(recordsData || [])

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

  const handleSubmitLearning = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!student) return

    setSubmitting(true)
    try {
      const learningData = {
        student_id: student.id,
        topic: newTopic || learningRecords.find(r => r.id === selectedRecord)?.topic,
        status,
        learning_date: learningDate,
        demo_date: demoDate || null,
        demo_status: demoDate ? demoStatus : null,
        quiz_score: quizScore ? parseInt(quizScore) : null,
        xmp_topic: xmpTopic || null,
        xmp_assignment: xmpAssignment || null,
        xmp_status: xmpTopic ? xmpStatus : null,
        notes: notes || null,
      }

      if (selectedRecord) {
        // Update existing record
        const { error } = await supabase
          .from('learning_records')
          .update(learningData)
          .eq('id', selectedRecord)
        
        if (error) throw error
      } else {
        // Create new record
        const { error } = await supabase
          .from('learning_records')
          .insert(learningData)
        
        if (error) throw error
      }

      // Update attendance
      const today = format(new Date(), 'yyyy-MM-dd')
      const { error: attendanceError } = await supabase
        .from('attendance_records')
        .upsert({
          student_id: student.id,
          date: today,
          status: attendanceStatus,
          notes: attendanceNotes || null,
        }, {
          onConflict: 'student_id,date'
        })

      if (attendanceError) throw attendanceError

      // Update student's last activity and potentially streak
      const { error: studentUpdateError } = await supabase
        .from('students')
        .update({
          last_activity: today,
          overall_progress: Math.min(100, student.overall_progress + (status === 'completed' ? 5 : 2)),
        })
        .eq('id', student.id)

      if (studentUpdateError) throw studentUpdateError

      toast({
        title: 'Success!',
        description: selectedRecord ? 'Learning record updated successfully' : 'New learning record added successfully',
      })

      // Reset form
      setSelectedRecord('')
      setNewTopic('')
      setStatus('not-started')
      setLearningDate(format(new Date(), 'yyyy-MM-dd'))
      setDemoDate('')
      setQuizScore('')
      setXmpTopic('')
      setXmpAssignment('')
      setNotes('')
      setAttendanceNotes('')

      // Refresh data
      await fetchStudentData()

    } catch (error) {
      console.error('Error submitting learning update:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit learning update',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Update Your Learning</h1>
        <p className="text-muted-foreground">Track your daily learning progress and attendance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Update Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Learning Progress
            </CardTitle>
            <CardDescription>Update your learning activities and progress</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitLearning} className="space-y-4">
              <div className="space-y-2">
                <Label>Update Existing Topic or Add New</Label>
                <Select value={selectedRecord} onValueChange={setSelectedRecord}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select existing topic to update" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Create new topic</SelectItem>
                    {learningRecords.map((record) => (
                      <SelectItem key={record.id} value={record.id}>
                        {record.topic} ({record.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!selectedRecord && (
                <div className="space-y-2">
                  <Label htmlFor="newTopic">New Topic</Label>
                  <Input
                    id="newTopic"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="Enter new topic name"
                    required={!selectedRecord}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="learningDate">Learning Date</Label>
                  <Input
                    id="learningDate"
                    type="date"
                    value={learningDate}
                    onChange={(e) => setLearningDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="demoDate">Demo Date (Optional)</Label>
                  <Input
                    id="demoDate"
                    type="date"
                    value={demoDate}
                    onChange={(e) => setDemoDate(e.target.value)}
                  />
                </div>
              </div>

              {demoDate && (
                <div className="space-y-2">
                  <Label>Demo Status</Label>
                  <Select value={demoStatus} onValueChange={(value: any) => setDemoStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="yes-to-do">Yes to Do</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="quizScore">Quiz Score (Optional)</Label>
                <Input
                  id="quizScore"
                  type="number"
                  min="0"
                  max="100"
                  value={quizScore}
                  onChange={(e) => setQuizScore(e.target.value)}
                  placeholder="Enter quiz score (0-100)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="xmpTopic">XMP Topic (Optional)</Label>
                  <Input
                    id="xmpTopic"
                    value={xmpTopic}
                    onChange={(e) => setXmpTopic(e.target.value)}
                    placeholder="XMP topic"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="xmpAssignment">XMP Assignment (Optional)</Label>
                  <Input
                    id="xmpAssignment"
                    value={xmpAssignment}
                    onChange={(e) => setXmpAssignment(e.target.value)}
                    placeholder="XMP assignment"
                  />
                </div>
              </div>

              {xmpTopic && (
                <div className="space-y-2">
                  <Label>XMP Status</Label>
                  <Select value={xmpStatus} onValueChange={(value: any) => setXmpStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                  rows={3}
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Submitting...' : selectedRecord ? 'Update Learning Record' : 'Add Learning Record'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Attendance Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Attendance
            </CardTitle>
            <CardDescription>Mark your attendance for today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Attendance Status</Label>
              <Select value={attendanceStatus} onValueChange={(value: any) => setAttendanceStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="attendanceNotes">Notes (Optional)</Label>
              <Textarea
                id="attendanceNotes"
                value={attendanceNotes}
                onChange={(e) => setAttendanceNotes(e.target.value)}
                placeholder="Add attendance notes..."
                rows={3}
              />
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Your attendance will be automatically updated when you submit your learning record.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Records */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Learning Records</CardTitle>
          <CardDescription>Your latest learning activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {learningRecords.slice(0, 5).map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{record.topic}</h4>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(record.learning_date), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    record.status === 'completed' ? 'bg-success/10 text-success' :
                    record.status === 'in-progress' ? 'bg-warning/10 text-warning' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {record.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {record.status}
                  </span>
                  {record.quiz_score && (
                    <span className="text-sm text-muted-foreground">
                      {record.quiz_score}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}