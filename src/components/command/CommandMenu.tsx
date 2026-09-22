import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Command } from 'cmdk'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

const commands = [
  { label: 'Add Asset', href: '/assets/new' },
  { label: 'Search Assets', href: '/assets' },
  { label: 'Scan Asset', href: '/verification/scan' },
  { label: 'Create Transfer', href: '/transfers' },
  { label: 'Create Maintenance', href: '/maintenance/work-orders' },
  { label: 'Start Verification', href: '/verification' },
  { label: 'Import Excel', href: '/assets/import' },
  { label: 'Open Reports', href: '/reports' },
  { label: 'Open Settings', href: '/settings' },
]

export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
          <Command.Input placeholder="Type a command or search…" className="h-12 border-b px-4 text-sm outline-none" />
          <Command.List className="max-h-72 overflow-y-auto p-2">
            <Command.Empty>No results found.</Command.Empty>
            <Command.Group heading="Commands">
              {commands.map((cmd) => (
                <Command.Item
                  key={cmd.href}
                  value={cmd.label}
                  className="cursor-pointer rounded-md px-3 py-2 text-sm aria-selected:bg-accent"
                  onSelect={() => {
                    navigate(cmd.href)
                    setOpen(false)
                  }}
                >
                  {cmd.label}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
