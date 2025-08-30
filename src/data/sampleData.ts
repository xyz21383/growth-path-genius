export interface StudentProgress {
  id: string;
  name: string;
  topics: LearningTopic[];
  overallProgress: number;
  streakDays: number;
  lastActivity: string;
}

export interface LearningTopic {
  id: string;
  title: string;
  status: 'done' | 'in-progress' | 'not-started';
  learningDate: string;
  demoDate?: string;
  demoStatus?: 'completed' | 'pending' | 'yes-to-do';
  quizScore?: number;
  xmpTopic?: string;
  xmpAssignment?: string;
  xmpStatus?: 'completed' | 'pending';
}

export const sampleStudents: StudentProgress[] = [
  {
    id: "1",
    name: "Alex Johnson",
    overallProgress: 85,
    streakDays: 12,
    lastActivity: "2024-08-30",
    topics: [
      {
        id: "1",
        title: "Introduction to HTML",
        status: "done",
        learningDate: "2024-08-20",
        demoDate: "2024-08-25",
        demoStatus: "completed",
        quizScore: 95,
        xmpTopic: "Professional Development",
        xmpAssignment: "HTML Project",
        xmpStatus: "completed"
      },
      {
        id: "2", 
        title: "CSS Fundamentals",
        status: "done",
        learningDate: "2024-08-22",
        demoDate: "2024-08-27",
        demoStatus: "completed",
        quizScore: 88,
        xmpTopic: "Web Design",
        xmpAssignment: "CSS Styling",
        xmpStatus: "completed"
      },
      {
        id: "3",
        title: "JavaScript Basics",
        status: "in-progress",
        learningDate: "2024-08-28",
        demoStatus: "yes-to-do",
        xmpTopic: "Programming Logic",
        xmpAssignment: "JS Functions",
        xmpStatus: "pending"
      }
    ]
  },
  {
    id: "2",
    name: "Sarah Chen",
    overallProgress: 92,
    streakDays: 18,
    lastActivity: "2024-08-30",
    topics: [
      {
        id: "1",
        title: "Introduction to HTML",
        status: "done",
        learningDate: "2024-08-18",
        demoDate: "2024-08-23",
        demoStatus: "completed",
        quizScore: 98,
        xmpTopic: "Professional Development",
        xmpAssignment: "HTML Project",
        xmpStatus: "completed"
      },
      {
        id: "2",
        title: "CSS Fundamentals", 
        status: "done",
        learningDate: "2024-08-20",
        demoDate: "2024-08-25",
        demoStatus: "completed",
        quizScore: 94,
        xmpTopic: "Web Design",
        xmpAssignment: "CSS Styling",
        xmpStatus: "completed"
      },
      {
        id: "3",
        title: "JavaScript Basics",
        status: "done",
        learningDate: "2024-08-26",
        demoDate: "2024-08-29",
        demoStatus: "completed",
        quizScore: 91,
        xmpTopic: "Programming Logic",
        xmpAssignment: "JS Functions",
        xmpStatus: "completed"
      }
    ]
  },
  {
    id: "3",
    name: "Michael Rodriguez",
    overallProgress: 76,
    streakDays: 8,
    lastActivity: "2024-08-29",
    topics: [
      {
        id: "1",
        title: "Introduction to HTML",
        status: "done",
        learningDate: "2024-08-21",
        demoDate: "2024-08-26",
        demoStatus: "completed",
        quizScore: 82,
        xmpTopic: "Professional Development",
        xmpAssignment: "HTML Project",
        xmpStatus: "completed"
      },
      {
        id: "2",
        title: "CSS Fundamentals",
        status: "in-progress",
        learningDate: "2024-08-28",
        demoStatus: "pending",
        xmpTopic: "Web Design",
        xmpAssignment: "CSS Styling",
        xmpStatus: "pending"
      }
    ]
  },
  {
    id: "4",
    name: "Emily Davis",
    overallProgress: 88,
    streakDays: 15,
    lastActivity: "2024-08-30",
    topics: [
      {
        id: "1",
        title: "Introduction to HTML",
        status: "done",
        learningDate: "2024-08-19",
        demoDate: "2024-08-24",
        demoStatus: "completed",
        quizScore: 93,
        xmpTopic: "Professional Development",
        xmpAssignment: "HTML Project",
        xmpStatus: "completed"
      },
      {
        id: "2",
        title: "CSS Fundamentals",
        status: "done",
        learningDate: "2024-08-23",
        demoDate: "2024-08-28",
        demoStatus: "completed",
        quizScore: 89,
        xmpTopic: "Web Design", 
        xmpAssignment: "CSS Styling",
        xmpStatus: "completed"
      },
      {
        id: "3",
        title: "JavaScript Basics",
        status: "in-progress",
        learningDate: "2024-08-29",
        demoStatus: "yes-to-do",
        xmpTopic: "Programming Logic",
        xmpAssignment: "JS Functions",
        xmpStatus: "pending"
      }
    ]
  },
  {
    id: "5",
    name: "David Thompson",
    overallProgress: 71,
    streakDays: 5,
    lastActivity: "2024-08-28",
    topics: [
      {
        id: "1",
        title: "Introduction to HTML",
        status: "done",
        learningDate: "2024-08-22",
        demoDate: "2024-08-27",
        demoStatus: "completed",
        quizScore: 78,
        xmpTopic: "Professional Development",
        xmpAssignment: "HTML Project",
        xmpStatus: "completed"
      },
      {
        id: "2",
        title: "CSS Fundamentals",
        status: "in-progress", 
        learningDate: "2024-08-28",
        demoStatus: "pending",
        xmpTopic: "Web Design",
        xmpAssignment: "CSS Styling",
        xmpStatus: "pending"
      }
    ]
  }
];

export const allTopics = [
  "Introduction to HTML",
  "CSS Fundamentals", 
  "JavaScript Basics",
  "React Fundamentals",
  "Node.js Basics",
  "Database Design",
  "API Development",
  "Testing & Debugging",
  "Deployment Strategies",
  "Version Control with Git"
];