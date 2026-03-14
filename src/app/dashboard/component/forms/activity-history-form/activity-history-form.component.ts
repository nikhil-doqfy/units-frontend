import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LeadsService } from '../../../services/leads.service';

interface ActivityLog {
  id: number;
  activity_type: string;
  title: string;
  description: string;
  scheduled_date: string | null;
  created_at: string;
  created_by_name: string;
}

interface LogGroup {
  label: string;
  year: number;
  logs: ActivityLog[];
}

@Component({
  selector: 'app-activity-history-form',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './activity-history-form.component.html',
  styleUrl: './activity-history-form.component.css',
})
export class ActivityHistoryFormComponent implements OnChanges {
  @Input() editData: any = null;

  private leadsService = inject(LeadsService);

  activityLogs: ActivityLog[] = [];
  groupedLogs: LogGroup[] = [];

  activityTypeIcons: Record<string, { icon: string; color: string }> = {
    NOTE: { icon: 'ri-sticky-note-line', color: 'orange' },
    CALL_LOG: { icon: 'ri-phone-line', color: 'green' },
    EMAIL_LOG: { icon: 'ri-mail-line', color: 'blue' },
    MEETING: { icon: 'ri-calendar-event-line', color: 'purple' },
    WHATSAPP_LOG: { icon: 'ri-whatsapp-line', color: 'whatsapp' },
    STATUS_CHANGE: { icon: 'ri-refresh-line', color: 'grey' },
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editData'] && this.editData?.id) {
      this.loadLogs();
    }
  }

  loadLogs(): void {
    this.leadsService.getActivityLogs(this.editData.id).subscribe({
      next: (resp: any) => {
        this.activityLogs = resp?.content || [];
        this.buildGroups();
      },
    });
  }

  private buildGroups(): void {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const buckets = new Map<string, { year: number; logs: ActivityLog[] }>();

    for (const log of this.activityLogs) {
      const d = this.parseDate(log.created_at);
      const year = d ? d.getFullYear() : 0;
      let label: string;

      if (d && d >= startOfWeek) {
        label = 'This week';
      } else if (d && d >= startOfMonth) {
        label = 'This month';
      } else if (d) {
        label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
      } else {
        label = 'Unknown';
      }

      const key = `${year}-${label}`;
      if (!buckets.has(key)) {
        buckets.set(key, { year, logs: [] });
      }
      buckets.get(key)!.logs.push(log);
    }

    this.groupedLogs = Array.from(buckets.entries()).map(([key, val]) => ({
      label: key.split('-').slice(1).join('-'),
      year: val.year,
      logs: val.logs,
    }));
  }

  private parseDate(str: string): Date | null {
    if (!str) return null;
    // format: "MM/DD/YYYY HH:mm"
    const [datePart, timePart] = str.split(' ');
    if (!datePart) return null;
    const [month, day, year] = datePart.split('/');
    if (timePart) {
      return new Date(`${year}-${month}-${day}T${timePart}`);
    }
    return new Date(`${year}-${month}-${day}`);
  }

  getTypeInfo(type: string) {
    return this.activityTypeIcons[type] ?? { icon: 'ri-time-line', color: 'grey' };
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  deleteLog(logId: number): void {
    this.leadsService.deleteActivityLog(logId).subscribe({
      next: () => {
        this.activityLogs = this.activityLogs.filter((l) => l.id !== logId);
        this.buildGroups();
      },
    });
  }
}
