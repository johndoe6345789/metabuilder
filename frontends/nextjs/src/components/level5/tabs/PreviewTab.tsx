import { Button } from '@/components/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Eye } from '@phosphor-icons/react'

interface PreviewTabProps {
  onPreview: (level: number) => void
}

export function PreviewTab({ onPreview }: PreviewTabProps) {
  return (
    <Card className="bg-black/40 border-white/10 text-white">
      <CardHeader>
        <CardTitle>Preview Application Levels</CardTitle>
        <CardDescription className="text-gray-400">
          View how each level appears to different user roles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => onPreview(1)}>
            <CardHeader>
              <CardTitle className="text-white">Level 1: Public</CardTitle>
              <CardDescription className="text-gray-400">Landing page and public content</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => onPreview(2)}>
            <CardHeader>
              <CardTitle className="text-white">Level 2: User Area</CardTitle>
              <CardDescription className="text-gray-400">User dashboard and profile</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => onPreview(3)}>
            <CardHeader>
              <CardTitle className="text-white">Level 3: Admin Panel</CardTitle>
              <CardDescription className="text-gray-400">Data management interface</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => onPreview(4)}>
            <CardHeader>
              <CardTitle className="text-white">Level 4: God Panel</CardTitle>
              <CardDescription className="text-gray-400">System builder interface</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
