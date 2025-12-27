"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { ScrollArea } from '@/components/ui'
import { Input } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui'
import { Warning, CheckCircle, Info, Trash, Broom } from '@phosphor-icons/react'
import { Database } from '@/lib/database'
import type { ErrorLog } from '@/lib/db/error-logs'
import { toast } from 'sonner'

export function ErrorLogsTab() {
  const [logs, setLogs] = useState<ErrorLog[]>([])
  const [loading, setLoading] = useState(false)
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [filterResolved, setFilterResolved] = useState<string>('all')
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [clearOnlyResolved, setClearOnlyResolved] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    errors: 0,
    warnings: 0,
    info: 0,
    resolved: 0,
    unresolved: 0,
  })

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const data = await Database.getErrorLogs()
      setLogs(data)
      calculateStats(data)
    } catch (error) {
      toast.error('Failed to load error logs')
      console.error('Error loading logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (logs: ErrorLog[]) => {
    setStats({
      total: logs.length,
      errors: logs.filter(l => l.level === 'error').length,
      warnings: logs.filter(l => l.level === 'warning').length,
      info: logs.filter(l => l.level === 'info').length,
      resolved: logs.filter(l => l.resolved).length,
      unresolved: logs.filter(l => !l.resolved).length,
    })
  }

  const handleMarkResolved = async (id: string) => {
    try {
      await Database.updateErrorLog(id, {
        resolved: true,
        resolvedAt: Date.now(),
        resolvedBy: 'supergod',
      })
      await loadLogs()
      toast.success('Error log marked as resolved')
    } catch (error) {
      toast.error('Failed to update error log')
    }
  }

  const handleDeleteLog = async (id: string) => {
    try {
      await Database.deleteErrorLog(id)
      await loadLogs()
      toast.success('Error log deleted')
    } catch (error) {
      toast.error('Failed to delete error log')
    }
  }

  const handleClearLogs = async () => {
    try {
      const count = await Database.clearErrorLogs(clearOnlyResolved)
      await loadLogs()
      toast.success(`Cleared ${count} error log${count !== 1 ? 's' : ''}`)
      setShowClearDialog(false)
    } catch (error) {
      toast.error('Failed to clear error logs')
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <Warning className="w-5 h-5" weight="fill" />
      case 'warning':
        return <Warning className="w-5 h-5" />
      case 'info':
        return <Info className="w-5 h-5" />
      default:
        return <Info className="w-5 h-5" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'info':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  const filteredLogs = logs.filter(log => {
    if (filterLevel !== 'all' && log.level !== filterLevel) return false
    if (filterResolved === 'resolved' && !log.resolved) return false
    if (filterResolved === 'unresolved' && log.resolved) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card className="bg-black/40 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{stats.errors}</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{stats.warnings}</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{stats.info}</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{stats.resolved}</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Unresolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">{stats.unresolved}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/40 border-white/10 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Error Logs</CardTitle>
              <CardDescription className="text-gray-400">
                Track and manage system errors, warnings, and info messages
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={loadLogs} disabled={loading} size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
              <Button 
                onClick={() => {
                  setClearOnlyResolved(false)
                  setShowClearDialog(true)
                }} 
                size="sm" 
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/20"
              >
                <Broom className="w-4 h-4 mr-2" />
                Clear All
              </Button>
              <Button 
                onClick={() => {
                  setClearOnlyResolved(true)
                  setShowClearDialog(true)
                }} 
                size="sm" 
                variant="outline"
                className="border-green-500/50 text-green-400 hover:bg-green-500/20"
              >
                <Broom className="w-4 h-4 mr-2" />
                Clear Resolved
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-white">
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="error">Errors</SelectItem>
                <SelectItem value="warning">Warnings</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterResolved} onValueChange={setFilterResolved}>
              <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="unresolved">Unresolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-3">
              {filteredLogs.length === 0 && !loading && (
                <div className="py-12 text-center text-gray-400">
                  No error logs found
                </div>
              )}
              
              {filteredLogs.map((log) => (
                <Card 
                  key={log.id} 
                  className={`bg-white/5 border-white/10 ${log.resolved ? 'opacity-60' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded ${getLevelColor(log.level)}`}>
                            {getLevelIcon(log.level)}
                          </div>
                          <Badge variant="outline" className={getLevelColor(log.level)}>
                            {log.level.toUpperCase()}
                          </Badge>
                          {log.resolved && (
                            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Resolved
                            </Badge>
                          )}
                          <span className="text-xs text-gray-400">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        
                        <div>
                          <p className="text-white font-medium">{log.message}</p>
                          {log.source && (
                            <p className="text-xs text-gray-400 mt-1">
                              Source: {log.source}
                            </p>
                          )}
                          {log.username && (
                            <p className="text-xs text-gray-400 mt-1">
                              User: {log.username} {log.userId && `(${log.userId})`}
                            </p>
                          )}
                        </div>
                        
                        {log.stack && (
                          <details className="text-xs text-gray-400 bg-black/40 p-2 rounded">
                            <summary className="cursor-pointer hover:text-white">
                              Stack trace
                            </summary>
                            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap">
                              {log.stack}
                            </pre>
                          </details>
                        )}
                        
                        {log.context && (
                          <details className="text-xs text-gray-400 bg-black/40 p-2 rounded">
                            <summary className="cursor-pointer hover:text-white">
                              Context
                            </summary>
                            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap">
                              {JSON.stringify(JSON.parse(log.context), null, 2)}
                            </pre>
                          </details>
                        )}
                        
                        {log.resolved && log.resolvedAt && (
                          <p className="text-xs text-green-400">
                            Resolved on {new Date(log.resolvedAt).toLocaleString()}
                            {log.resolvedBy && ` by ${log.resolvedBy}`}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {!log.resolved && (
                          <Button
                            onClick={() => handleMarkResolved(log.id)}
                            size="sm"
                            variant="outline"
                            className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Resolve
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDeleteLog(log.id)}
                          size="sm"
                          variant="outline"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                        >
                          <Trash className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-300">
              <Warning className="w-6 h-6" weight="fill" />
              Confirm Clear Error Logs
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              {clearOnlyResolved
                ? 'This will permanently delete all resolved error logs. This action cannot be undone.'
                : 'This will permanently delete ALL error logs. This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearLogs}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
            >
              Clear Logs
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
