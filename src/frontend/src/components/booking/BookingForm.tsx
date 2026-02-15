import { useState, useEffect } from 'react';
import { useRequestBooking } from '@/hooks/useRequestBooking';
import { usePreviewBooking } from '@/hooks/usePreviewBooking';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Calendar, Clock, Users, AlertTriangle, Phone, User } from 'lucide-react';
import { VENUES } from '@/constants/venues';
import { getClubOptions, OTHERS_OPTION } from '@/constants/clubs';
import { normalizeVenueLabel } from '@/utils/venueLabel';
import BookingPreviewSummaryPanel from './BookingPreviewSummaryPanel';
import type { BookingResponse, SimultaneousEventWarning, ValidationWarning } from '@/backend';

export default function BookingForm() {
  const [selectedClub, setSelectedClub] = useState('');
  const [customClubName, setCustomClubName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [expectedAudience, setExpectedAudience] = useState('');
  const [validationError, setValidationError] = useState('');
  const [confirmRestGap, setConfirmRestGap] = useState(false);
  const [lastSuccessResponse, setLastSuccessResponse] = useState<BookingResponse | null>(null);
  
  // Preview state
  const [previewResult, setPreviewResult] = useState<ValidationWarning | null | undefined>(undefined);
  const [hasRunPreview, setHasRunPreview] = useState(false);

  const { mutate: requestBooking, isPending: isSubmitting, reset: resetBooking } = useRequestBooking();
  const { mutate: previewBooking, isPending: isPreviewing, reset: resetPreview } = usePreviewBooking();

  const clubOptions = getClubOptions();
  const isOthersSelected = selectedClub === OTHERS_OPTION;

  // Mark preview as stale when inputs change
  useEffect(() => {
    if (hasRunPreview) {
      setHasRunPreview(false);
      setPreviewResult(undefined);
      setConfirmRestGap(false);
    }
  }, [selectedClub, customClubName, eventDescription, contactName, contactPhone, venue, date, startTime, endTime, expectedAudience]);

  const validatePhone = (phone: string): boolean => {
    return /^[\d\s+\-]+$/.test(phone);
  };

  const validateInputs = (): { isValid: boolean; finalClubName: string; audienceNum: number } => {
    setValidationError('');

    const finalClubName = isOthersSelected ? customClubName.trim() : selectedClub;

    if (!finalClubName) {
      setValidationError('Please provide a club / event name');
      return { isValid: false, finalClubName: '', audienceNum: 0 };
    }

    if (!contactName.trim()) {
      setValidationError('Please provide the club head contact name');
      return { isValid: false, finalClubName: '', audienceNum: 0 };
    }

    if (!contactPhone.trim()) {
      setValidationError('Please provide the club head contact phone number');
      return { isValid: false, finalClubName: '', audienceNum: 0 };
    }

    if (!validatePhone(contactPhone)) {
      setValidationError('Phone number can only contain digits, spaces, +, and -');
      return { isValid: false, finalClubName: '', audienceNum: 0 };
    }

    if (startTime && endTime) {
      const startInt = parseInt(startTime.replace(':', ''));
      const endInt = parseInt(endTime.replace(':', ''));
      if (endInt <= startInt) {
        setValidationError('End time must be after start time');
        return { isValid: false, finalClubName: '', audienceNum: 0 };
      }
    }

    const audienceNum = parseInt(expectedAudience);
    if (!expectedAudience || isNaN(audienceNum) || audienceNum <= 0) {
      setValidationError('Please enter a valid expected audience (positive number)');
      return { isValid: false, finalClubName: '', audienceNum: 0 };
    }

    return { isValid: true, finalClubName, audienceNum };
  };

  const handleReviewSummary = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateInputs();
    if (!validation.isValid) return;

    const { finalClubName, audienceNum } = validation;
    const startTimeInt = startTime.replace(':', '');
    const endTimeInt = endTime.replace(':', '');

    resetPreview();
    setLastSuccessResponse(null);

    previewBooking(
      {
        clubName: finalClubName,
        eventDescription: eventDescription.trim(),
        clubContact: {
          name: contactName.trim(),
          phone: contactPhone.trim(),
        },
        venue,
        date,
        startTime: startTimeInt,
        endTime: endTimeInt,
        expectedAudience: audienceNum,
      },
      {
        onSuccess: (result) => {
          setPreviewResult(result);
          setHasRunPreview(true);
          setConfirmRestGap(false);
        },
        onError: (error) => {
          if (error.message.includes('Unauthorized') || error.message.includes('Not Registered')) {
            setValidationError('You must be logged in and registered to preview bookings');
          } else {
            setValidationError(`Preview failed: ${error.message}`);
          }
        },
      }
    );
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasRunPreview) {
      setValidationError('Please review the summary before confirming');
      return;
    }

    // If preview returned null (hard conflict), don't allow submission
    if (previewResult === null) {
      setValidationError('Cannot proceed with booking due to hard conflict');
      return;
    }

    // If rest gap warning exists and not confirmed, don't allow submission
    if (previewResult?.restGapWarning && !confirmRestGap) {
      setValidationError('Please confirm the rest gap warning to proceed');
      return;
    }

    const validation = validateInputs();
    if (!validation.isValid) return;

    const { finalClubName, audienceNum } = validation;
    const startTimeInt = startTime.replace(':', '');
    const endTimeInt = endTime.replace(':', '');

    resetBooking();

    requestBooking(
      {
        clubName: finalClubName,
        eventDescription: eventDescription.trim(),
        clubContact: {
          name: contactName.trim(),
          phone: contactPhone.trim(),
        },
        venue,
        date,
        startTime: startTimeInt,
        endTime: endTimeInt,
        expectedAudience: audienceNum,
        confirmRestGap,
      },
      {
        onSuccess: (response) => {
          if (response.__kind__ === 'success') {
            setLastSuccessResponse(response);
            // Reset form
            setSelectedClub('');
            setCustomClubName('');
            setEventDescription('');
            setContactName('');
            setContactPhone('');
            setVenue('');
            setDate('');
            setStartTime('');
            setEndTime('');
            setExpectedAudience('');
            setConfirmRestGap(false);
            setHasRunPreview(false);
            setPreviewResult(undefined);
          } else if (response.__kind__ === 'conflict') {
            setLastSuccessResponse(response);
          }
        },
        onError: (error) => {
          setValidationError(`Booking failed: ${error.message}`);
        },
      }
    );
  };

  const formatTime = (time: string) => {
    const hours = time.slice(0, -2).padStart(2, '0');
    const mins = time.slice(-2);
    return `${hours}:${mins}`;
  };

  const renderConflictError = (response: BookingResponse) => {
    if (response.__kind__ !== 'conflict') return null;

    const { conflictingBooking, message } = response.conflict;
    
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Booking Conflict</AlertTitle>
        <AlertDescription>
          <div className="space-y-2 mt-2">
            <p className="font-medium">{message}</p>
            <div className="text-sm space-y-1 mt-3 p-3 bg-destructive/10 rounded-md">
              <p><strong>Club / Event:</strong> {conflictingBooking.clubName}</p>
              <p><strong>Venue:</strong> {normalizeVenueLabel(conflictingBooking.venue)}</p>
              <p><strong>Time:</strong> {formatTime(conflictingBooking.startTime)} - {formatTime(conflictingBooking.endTime)}</p>
              <p><strong>Contact:</strong> {conflictingBooking.clubContact.name}</p>
              <p><strong>Phone:</strong> {conflictingBooking.clubContact.phone}</p>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  const renderSimultaneousWarnings = (warnings: SimultaneousEventWarning[]) => {
    if (warnings.length === 0) return null;

    return (
      <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
        <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <AlertTitle className="text-yellow-600 dark:text-yellow-400">Simultaneous Events</AlertTitle>
        <AlertDescription className="text-yellow-600 dark:text-yellow-400">
          <p className="font-medium mb-2">Heads up! The following events are happening at the same time:</p>
          <div className="space-y-3 mt-2">
            {warnings.map((warning, idx) => (
              <div key={idx} className="text-sm p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-md">
                <p><strong>Club / Event:</strong> {warning.clubName}</p>
                <p><strong>Venue:</strong> {normalizeVenueLabel(warning.venue)}</p>
                <p><strong>Time:</strong> {formatTime(warning.startTime)} - {formatTime(warning.endTime)}</p>
                <p><strong>Contact:</strong> {warning.contactDetails.name}</p>
                <p><strong>Phone:</strong> {warning.contactDetails.phone}</p>
              </div>
            ))}
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  const canSubmitFinalBooking = hasRunPreview && 
    previewResult !== null && 
    (!previewResult?.restGapWarning || confirmRestGap);

  return (
    <div className="space-y-6">
      <form onSubmit={hasRunPreview ? handleConfirmBooking : handleReviewSummary} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clubName">Club / Event</Label>
            <Select value={selectedClub} onValueChange={setSelectedClub} disabled={isPreviewing || isSubmitting} required>
              <SelectTrigger id="clubName">
                <SelectValue placeholder="Select club or event" />
              </SelectTrigger>
              <SelectContent>
                {clubOptions.map((club) => (
                  <SelectItem key={club} value={club}>
                    {club}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isOthersSelected && (
            <div className="space-y-2">
              <Label htmlFor="customClubName">Custom Club / Event Name</Label>
              <Input
                id="customClubName"
                placeholder="Enter club or event name"
                value={customClubName}
                onChange={(e) => setCustomClubName(e.target.value)}
                required
                disabled={isPreviewing || isSubmitting}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="venue">Venue</Label>
            <Select value={venue} onValueChange={setVenue} disabled={isPreviewing || isSubmitting} required>
              <SelectTrigger id="venue">
                <SelectValue placeholder="Select venue" />
              </SelectTrigger>
              <SelectContent>
                {VENUES.map((v) => (
                  <SelectItem key={v} value={v}>
                    {normalizeVenueLabel(v)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="eventDescription">Event Description (Optional)</Label>
          <Textarea
            id="eventDescription"
            placeholder="Describe your event (e.g., workshop details, guest speakers, agenda...)"
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
            disabled={isPreviewing || isSubmitting}
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contactName">
              <User className="inline h-4 w-4 mr-1" />
              Club Head Contact Name
            </Label>
            <Input
              id="contactName"
              placeholder="e.g., John Doe"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              required
              disabled={isPreviewing || isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">
              <Phone className="inline h-4 w-4 mr-1" />
              Club Head Contact Phone
            </Label>
            <Input
              id="contactPhone"
              placeholder="e.g., +91 98765 43210"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              required
              disabled={isPreviewing || isSubmitting}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">
              <Calendar className="inline h-4 w-4 mr-1" />
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={isPreviewing || isSubmitting}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startTime">
              <Clock className="inline h-4 w-4 mr-1" />
              Start Time
            </Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              disabled={isPreviewing || isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime">
              <Clock className="inline h-4 w-4 mr-1" />
              End Time
            </Label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              disabled={isPreviewing || isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedAudience">
              <Users className="inline h-4 w-4 mr-1" />
              Expected Audience
            </Label>
            <Input
              id="expectedAudience"
              type="number"
              min="1"
              placeholder="e.g., 50"
              value={expectedAudience}
              onChange={(e) => setExpectedAudience(e.target.value)}
              required
              disabled={isPreviewing || isSubmitting}
            />
          </div>
        </div>

        {validationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        {isPreviewing && (
          <Alert>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <AlertDescription>Checking for conflicts and warnings...</AlertDescription>
            </div>
          </Alert>
        )}

        {hasRunPreview && previewResult !== undefined && (
          <BookingPreviewSummaryPanel
            previewResult={previewResult}
            confirmRestGap={confirmRestGap}
            onConfirmRestGapChange={setConfirmRestGap}
            eventDescription={eventDescription.trim()}
          />
        )}

        {lastSuccessResponse && lastSuccessResponse.__kind__ === 'success' && (
          <>
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-600 dark:text-green-400">
                Booking Confirmed.
              </AlertDescription>
            </Alert>
            {renderSimultaneousWarnings(lastSuccessResponse.success.simultaneousEvents)}
          </>
        )}

        {lastSuccessResponse && lastSuccessResponse.__kind__ === 'conflict' && renderConflictError(lastSuccessResponse)}

        <div className="flex gap-3">
          {!hasRunPreview ? (
            <Button 
              type="submit" 
              disabled={isPreviewing} 
              className="w-full md:w-auto"
            >
              {isPreviewing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Checking...
                </>
              ) : (
                'Review Summary'
              )}
            </Button>
          ) : (
            <>
              <Button 
                type="button"
                variant="outline"
                onClick={() => {
                  setHasRunPreview(false);
                  setPreviewResult(undefined);
                  setConfirmRestGap(false);
                }}
                disabled={isSubmitting}
                className="w-full md:w-auto"
              >
                Edit Booking
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !canSubmitFinalBooking} 
                className="w-full md:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Submitting...
                  </>
                ) : (
                  'Confirm & Request Booking'
                )}
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
