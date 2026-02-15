import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, CheckCircle2, FileText } from 'lucide-react';
import { normalizeVenueLabel } from '@/utils/venueLabel';
import type { ValidationWarning } from '@/backend';

interface BookingPreviewSummaryPanelProps {
  previewResult: ValidationWarning | null;
  confirmRestGap: boolean;
  onConfirmRestGapChange: (checked: boolean) => void;
  eventDescription: string;
}

export default function BookingPreviewSummaryPanel({
  previewResult,
  confirmRestGap,
  onConfirmRestGapChange,
  eventDescription,
}: BookingPreviewSummaryPanelProps) {
  if (!previewResult) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Hard Conflict Detected</AlertTitle>
        <AlertDescription>
          <p className="font-medium">
            This booking conflicts with an existing event in the same venue at the same time.
          </p>
          <p className="mt-2 text-sm">
            Please change your venue, date, or time and review the summary again.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  const hasWarnings = 
    previewResult.simultaneousEventWarnings.length > 0 || 
    previewResult.restGapWarning !== undefined;

  const formatTime = (time: string) => {
    const hours = time.slice(0, -2).padStart(2, '0');
    const mins = time.slice(-2);
    return `${hours}:${mins}`;
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {hasWarnings ? (
            <>
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              Booking Summary - Warnings Detected
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              Booking Summary - No Issues
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {eventDescription && (
          <>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <FileText className="h-4 w-4" />
                Event Description
              </div>
              <p className="text-sm bg-muted/50 p-3 rounded-md whitespace-pre-wrap">
                {eventDescription}
              </p>
            </div>
            <Separator />
          </>
        )}

        {!hasWarnings && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              No conflicts or warnings detected. You can proceed with the booking.
            </AlertDescription>
          </Alert>
        )}

        {previewResult.simultaneousEventWarnings.length > 0 && (
          <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertTitle className="text-yellow-600 dark:text-yellow-400">
              Simultaneous Events
            </AlertTitle>
            <AlertDescription className="text-yellow-600 dark:text-yellow-400">
              <p className="font-medium mb-2">
                The following events are happening at the same time in different venues:
              </p>
              <div className="space-y-3 mt-2">
                {previewResult.simultaneousEventWarnings.map((warning, idx) => (
                  <div key={idx} className="text-sm p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-md">
                    <p><strong>Club / Event:</strong> {warning.clubName}</p>
                    <p><strong>Venue:</strong> {normalizeVenueLabel(warning.venue)}</p>
                    <p><strong>Time:</strong> {formatTime(warning.startTime)} - {formatTime(warning.endTime)}</p>
                    <p><strong>Contact:</strong> {warning.contactDetails.name}</p>
                    <p><strong>Phone:</strong> {warning.contactDetails.phone}</p>
                    <p><strong>Expected Audience:</strong> {warning.expectedAudience.toString()}</p>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {previewResult.restGapWarning && (
          <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertTitle className="text-yellow-600 dark:text-yellow-400">
              Rest Gap Warning
            </AlertTitle>
            <AlertDescription className="text-yellow-600 dark:text-yellow-400">
              <p className="mb-3">{previewResult.restGapWarning.message}</p>
              <p className="text-sm mb-3">
                Students need rest/transit time between events. Please confirm to proceed.
              </p>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="confirmRestGapPreview"
                  checked={confirmRestGap}
                  onCheckedChange={(checked) => onConfirmRestGapChange(checked === true)}
                />
                <label
                  htmlFor="confirmRestGapPreview"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Confirm Booking Anyway
                </label>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
