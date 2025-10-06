import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, Clock, Users, Play } from 'lucide-react'

interface MobileCourseCardProps {
  id: string
  title: string
  description: string
  thumbnail: string
  instructor: string
  duration: string
  rating: number
  enrollmentCount: number
  price: number
  difficulty: string
  category: string
}

export function MobileCourseCard({
  id,
  title,
  description,
  thumbnail,
  instructor,
  duration,
  rating,
  enrollmentCount,
  price,
  difficulty,
  category
}: MobileCourseCardProps) {
  return (
    <Card className="mobile-course-card overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="relative">
        <img 
          src={thumbnail} 
          alt={title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3">
          <Badge className="bg-black/70 text-white">
            {category}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant={difficulty === 'Beginner' ? 'secondary' : difficulty === 'Intermediate' ? 'default' : 'destructive'}>
            {difficulty}
          </Badge>
        </div>
        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
          <Button size="sm" variant="secondary" className="gap-2">
            <Play className="h-4 w-4" />
            Preview
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-2 mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2">{description}</p>
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {enrollmentCount}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {duration}
          </span>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{rating}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">by {instructor}</p>
            <p className="text-lg font-bold text-primary">৳{price}</p>
          </div>
          <Link to={`/course/${id}`}>
            <Button size="sm" className="shrink-0">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}