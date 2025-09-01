import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu'
import { User, LogOut, Settings, BookOpen, BarChart3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const Navigation: React.FC = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  if (!user) return null

  return (
    <nav className="bg-card border-b border-border p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => handleNavigation('/')}
            className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent"
          >
            Growth Path Genius
          </button>
          
          <div className="flex items-center space-x-4">
            {user.role === 'instructor' && (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => handleNavigation('/dashboard')}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => handleNavigation('/students')}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Students
                </Button>
              </>
            )}
            
            {user.role === 'student' && (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => handleNavigation('/my-progress')}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  My Progress
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => handleNavigation('/update-learning')}
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Update Learning
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="capitalize">
            {user.role}
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {user.full_name}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleNavigation('/profile')}>
                <Settings className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}