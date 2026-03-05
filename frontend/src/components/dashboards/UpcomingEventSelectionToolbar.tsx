import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Trash2 } from 'lucide-react';

interface UpcomingEventSelectionToolbarProps {
  selectedCount: number;
  onCancelSelected: () => void;
  onClearSelection: () => void;
  isLoading?: boolean;
}

export default function UpcomingEventSelectionToolbar({
  selectedCount,
  onCancelSelected,
  onClearSelection,
  isLoading = false,
}: UpcomingEventSelectionToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between p-4 bg-muted rounded-lg border">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">{selectedCount} selected</Badge>
        <Button variant="ghost" size="sm" onClick={onClearSelection} disabled={isLoading}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>
      <Button variant="destructive" size="sm" onClick={onCancelSelected} disabled={isLoading}>
        {isLoading ? (
          <>
            <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            Cancelling...
          </>
        ) : (
          <>
            <Trash2 className="h-4 w-4 mr-1" />
            Cancel Selected
          </>
        )}
      </Button>
    </div>
  );
}
