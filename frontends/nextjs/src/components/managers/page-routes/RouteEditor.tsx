import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@/components/ui'
import type { AppLevel,PageConfig, UserRole } from '@/lib/level-types'

export type RouteFormData = Partial<PageConfig>

interface RouteEditorProps {
  formData: RouteFormData
  onChange: (value: RouteFormData) => void
  onSave: () => void
  onCancel: () => void
  isEdit: boolean
}

export function RouteEditor({ formData, onChange, onSave, onCancel, isEdit }: RouteEditorProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="path">Route Path *</Label>
          <Input
            id="path"
            placeholder="/home"
            value={formData.path || ''}
            onChange={e => onChange({ ...formData, path: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Page Title *</Label>
          <Input
            id="title"
            placeholder="Home Page"
            value={formData.title || ''}
            onChange={e => onChange({ ...formData, title: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="level">Application Level</Label>
          <Select
            value={formData.level ? String(formData.level) : ''}
            onValueChange={value => onChange({ ...formData, level: Number(value) as AppLevel })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Level 1 - Public</SelectItem>
              <SelectItem value="2">Level 2 - User Area</SelectItem>
              <SelectItem value="3">Level 3 - Moderator Desk</SelectItem>
              <SelectItem value="4">Level 4 - Admin Panel</SelectItem>
              <SelectItem value="5">Level 5 - God Builder</SelectItem>
              <SelectItem value="6">Level 6 - Supergod Console</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="requiredRole">Required Role (if auth)</Label>
          <Select
            value={formData.requiredRole || 'public'}
            onValueChange={value => onChange({ ...formData, requiredRole: value as UserRole })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="god">God</SelectItem>
              <SelectItem value="supergod">Supergod</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="requiresAuth"
          checked={formData.requiresAuth}
          onCheckedChange={checked => onChange({ ...formData, requiresAuth: checked })}
        />
        <Label htmlFor="requiresAuth" className="cursor-pointer">
          Requires Authentication
        </Label>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={onSave}>
          {isEdit ? 'Update Page' : 'Create Page'}
        </Button>
      </div>
    </div>
  )
}
