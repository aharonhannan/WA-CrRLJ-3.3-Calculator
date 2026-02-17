import { useMemo } from 'react';
import { formatDate, getResetTypeLabel, getExclusionTypeLabel, parseLocalDate } from '../../utils/trialCalculator';
import { STRINGS } from '../../strings';
import type { CalculationResults } from '../../types';

interface TimelineProps {
  results: CalculationResults;
}

interface TimelineEvent {
  id: string;
  date: Date;
  type: 'arraignment' | 'reset' | 'status-change' | 'exclusion' | 'deadline' | 'cure' | 'trial';
  className: string;
  title: string;
  description: string;
  notes?: string;
  dateRange?: { start: Date; end: Date };
}

function Timeline({ results }: TimelineProps) {
  const events = useMemo(() => {
    const timelineEvents: TimelineEvent[] = [];

    // Initial Arraignment
    timelineEvents.push({
      id: 'arraignment',
      date: results.initialCommencementDate,
      type: 'arraignment',
      className: 'timeline-event',
      title: STRINGS.timeline.initialArraignment,
      description: STRINGS.timeline.initialCommencementDesc
    });

    // Resets
    if (results.resets) {
      results.resets.forEach((reset) => {
        timelineEvents.push({
          id: `reset-${reset.id}`,
          date: parseLocalDate(reset.date),
          type: 'reset',
          className: 'timeline-event timeline-reset',
          title: STRINGS.timeline.resetTitle,
          description: getResetTypeLabel(reset.type),
          notes: reset.notes || undefined
        });
      });
    }

    // Status Change (doesn't have a specific date, but happens before deadline)
    // We'll place it after the last reset or arraignment
    if (results.wasReleased) {
      const lastResetDate = results.resets && results.resets.length > 0
        ? parseLocalDate(results.resets[results.resets.length - 1].date)
        : results.initialCommencementDate;

      timelineEvents.push({
        id: 'status-change',
        date: new Date(lastResetDate.getTime() + 1), // Just after last reset
        type: 'status-change',
        className: 'timeline-event timeline-info',
        title: STRINGS.timeline.statusChangeTitle,
        description: STRINGS.timeline.statusChangeDesc
      });
    }

    // Excluded Periods
    if (results.excludedPeriods) {
      results.excludedPeriods.forEach((period, index) => {
        timelineEvents.push({
          id: `exclusion-${period.type}-${index}`,
          date: period.startDate,
          type: 'exclusion',
          className: 'timeline-event timeline-exclusion',
          title: STRINGS.timeline.excludedPeriodTitle(period.days),
          description: getExclusionTypeLabel(period.type),
          dateRange: { start: period.startDate, end: period.endDate }
        });
      });
    }

    // Scheduled Trial (if before deadline, insert in correct position)
    if (results.scheduledTrialDate) {
      timelineEvents.push({
        id: 'scheduled-trial',
        date: results.scheduledTrialDate,
        type: 'trial',
        className: `timeline-event ${results.isTimely ? 'timeline-trial-timely' : 'timeline-trial-untimely'}`,
        title: STRINGS.timeline.scheduledTrial,
        description: results.isTimely ? STRINGS.timeline.withinTime : STRINGS.timeline.outsideTime
      });
    }

    // Trial Deadline
    timelineEvents.push({
      id: 'deadline',
      date: results.finalDeadline,
      type: 'deadline',
      className: 'timeline-event timeline-deadline',
      title: STRINGS.timeline.trialDeadline,
      description: STRINGS.timeline.deadlineDesc(results.baseTimeLimit, results.excludedDays)
    });

    // Cure Period
    if (results.useCurePeriod && results.cureDeadline) {
      timelineEvents.push({
        id: 'cure',
        date: results.cureDeadline,
        type: 'cure',
        className: 'timeline-event timeline-cure',
        title: STRINGS.timeline.cureDeadlineTitle,
        description: STRINGS.timeline.cureDeadlineDesc(results.cureDays)
      });
    }

    // Sort by date
    return timelineEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [results]);

  return (
    <div className="timeline-container">
      <h3>{STRINGS.sections.timeline}</h3>

      {events.map((event) => (
        <div key={event.id} className={event.className}>
          <div className="timeline-date">
            {event.dateRange
              ? `${formatDate(event.dateRange.start)} - ${formatDate(event.dateRange.end)}`
              : formatDate(event.date)
            }
          </div>
          <div className="timeline-content">
            <strong>{event.title}</strong>
            <p>{event.description}</p>
            {event.notes && <p className="notes">{event.notes}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Timeline;
