import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { studentId, learningRecords, attendanceRecords } = await req.json()

    if (!studentId) {
      throw new Error('Student ID is required')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get Groq API key
    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    if (!groqApiKey) {
      throw new Error('Groq API key not configured')
    }

    // Prepare student data for analysis
    const completedTopics = learningRecords.filter((r: any) => r.status === 'completed').length
    const inProgressTopics = learningRecords.filter((r: any) => r.status === 'in-progress').length
    const averageQuizScore = learningRecords
      .filter((r: any) => r.quiz_score)
      .reduce((sum: number, r: any) => sum + r.quiz_score, 0) / 
      learningRecords.filter((r: any) => r.quiz_score).length || 0

    const recentAttendance = attendanceRecords.slice(0, 10)
    const attendanceRate = recentAttendance.length > 0 
      ? (recentAttendance.filter((a: any) => a.status === 'present').length / recentAttendance.length) * 100 
      : 0

    // Create prompt for Groq
    const prompt = `Analyze this student's learning data and provide personalized insights:

Student Learning Summary:
- Completed Topics: ${completedTopics}
- In Progress Topics: ${inProgressTopics}
- Average Quiz Score: ${averageQuizScore.toFixed(1)}%
- Recent Attendance Rate: ${attendanceRate.toFixed(1)}%
- Total Learning Records: ${learningRecords.length}

Recent Learning Activities:
${learningRecords.slice(0, 5).map((r: any) => 
  `- ${r.topic}: ${r.status} (${r.learning_date})`
).join('\n')}

Please provide:
1. A performance analysis (2-3 sentences)
2. Specific recommendations for improvement (2-3 actionable items)
3. Strengths to continue building on (1-2 items)

Keep the response concise, encouraging, and actionable. Focus on specific learning patterns and provide constructive feedback.`

    // Call Groq API
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an educational AI assistant that provides personalized learning insights and recommendations for students. Be encouraging, specific, and actionable in your feedback.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!groqResponse.ok) {
      throw new Error(`Groq API error: ${groqResponse.statusText}`)
    }

    const groqData = await groqResponse.json()
    const insight = groqData.choices[0]?.message?.content

    if (!insight) {
      throw new Error('No insight generated from Groq API')
    }

    // Generate different types of insights
    const insights = [
      {
        student_id: studentId,
        insight_type: 'performance',
        content: insight,
        generated_at: new Date().toISOString(),
      }
    ]

    // Generate a trend analysis if we have enough data
    if (learningRecords.length >= 3) {
      const trendPrompt = `Based on this student's learning timeline, identify key trends:

Learning Timeline:
${learningRecords.slice(0, 10).map((r: any) => 
  `${r.learning_date}: ${r.topic} - ${r.status}${r.quiz_score ? ` (${r.quiz_score}%)` : ''}`
).join('\n')}

Provide a brief trend analysis focusing on learning velocity, consistency, and areas of strength/challenge. Maximum 2-3 sentences.`

      const trendResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are an educational data analyst. Provide concise trend analysis based on student learning patterns.'
            },
            {
              role: 'user',
              content: trendPrompt
            }
          ],
          max_tokens: 200,
          temperature: 0.5,
        }),
      })

      if (trendResponse.ok) {
        const trendData = await trendResponse.json()
        const trendInsight = trendData.choices[0]?.message?.content

        if (trendInsight) {
          insights.push({
            student_id: studentId,
            insight_type: 'trend',
            content: trendInsight,
            generated_at: new Date().toISOString(),
          })
        }
      }
    }

    // Generate recommendations based on performance
    if (averageQuizScore > 0) {
      const recommendationPrompt = `Student Performance Context:
- Average Quiz Score: ${averageQuizScore.toFixed(1)}%
- Attendance Rate: ${attendanceRate.toFixed(1)}%
- Completion Rate: ${(completedTopics / learningRecords.length * 100).toFixed(1)}%

Provide 2-3 specific, actionable recommendations to help this student improve their learning outcomes. Focus on practical steps they can take.`

      const recResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are a learning coach. Provide specific, actionable recommendations for student improvement.'
            },
            {
              role: 'user',
              content: recommendationPrompt
            }
          ],
          max_tokens: 300,
          temperature: 0.6,
        }),
      })

      if (recResponse.ok) {
        const recData = await recResponse.json()
        const recommendation = recData.choices[0]?.message?.content

        if (recommendation) {
          insights.push({
            student_id: studentId,
            insight_type: 'recommendation',
            content: recommendation,
            generated_at: new Date().toISOString(),
          })
        }
      }
    }

    // Save insights to database
    const { error: insertError } = await supabaseClient
      .from('ai_insights')
      .insert(insights)

    if (insertError) {
      console.error('Error saving insights:', insertError)
      throw insertError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        insights: insights.length,
        message: 'AI insights generated successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in groq-insights function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})