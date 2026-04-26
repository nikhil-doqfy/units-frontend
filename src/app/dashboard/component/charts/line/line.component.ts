import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  OnInit,
} from '@angular/core';
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexStroke,
  ApexMarkers,
  ApexDataLabels,
  ApexYAxis,
  ApexLegend,
  ApexGrid,
  ApexTooltip,
  ChartComponent,
} from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';
import { ThemeService } from '../../../../theme.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  markers: ApexMarkers;
  dataLabels: ApexDataLabels;
  yaxis: ApexYAxis;
  legend: ApexLegend;
  grid: ApexGrid;
  tooltip: ApexTooltip;
  colors?: string[];
};

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './line.component.html',
  styleUrls: ['./line.component.css'],
})
export class LineChartComponent
  implements OnChanges, OnDestroy, OnInit, AfterViewInit
{
  @ViewChild('chart') chart!: ChartComponent;

  private destroy$ = new Subject<void>();
  private viewReady = false;

  public chartOptions: Partial<ChartOptions>;

  @Input() monthlyData: {
    monthName: string;
    totalAmount: number;
    receivedAmount: number;
    dueAmount: number;
  }[] = [];

  constructor(private themeService: ThemeService) {
    this.chartOptions = this.getBaseOptions();
  }

  private getBaseOptions(): Partial<ChartOptions> {
    return {
      series: [
        { name: 'Total Amount', data: [] },
        { name: 'Received Amount', data: [] },
        { name: 'Due Amount', data: [] },
      ],
      chart: {
        type: 'line',
        height: 220,
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { enabled: false },
      },
      stroke: { width: 3, curve: 'smooth' },
      markers: { size: 4, hover: { size: 6 } },
      dataLabels: { enabled: false },
      xaxis: {
        categories: [],
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: { colors: '#344046' },
        },
      },
      yaxis: {
        min: 0,
        max: 100,
        tickAmount: 5,
        labels: {
          style: { colors: '#344046' },
          formatter: (value: number) => {
            if (value == null) return '';
            return value + '%';
          },
        },
      },
      colors: ['#1988FD', '#00B7AD', '#4B9C5E'],
      legend: {
        position: 'top',
        horizontalAlign: 'center',
        labels: { colors: '#344046' },
        formatter: function (seriesName: string, opts: any) {
          const data = opts.w.globals.series[opts.seriesIndex];
          const total = data.reduce((a: number, b: number) => a + b, 0);
          const percent = Math.round((total / 600) * 100);
          return `${seriesName}   ${percent}%`;
        },
      },
      grid: {
        strokeDashArray: 0,
        borderColor: '#e0e0e0',
      },
      tooltip: {
        theme: 'light',
      },
    };
  }

  ngOnInit() {
    this.themeService.isDarkMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isDark) => {
        this.applyTheme(isDark);
      });
  }

  private applyTheme(isDark: boolean) {
    const axisColor = isDark ? '#FFFFFF' : '#344046';
    const gridColor = isDark ? '#e8e1e114' : '#0000001a';

    this.chartOptions = {
      ...this.chartOptions,
      xaxis: {
        ...this.chartOptions.xaxis,
        labels: { style: { colors: axisColor } },
        axisBorder: { show: false, color: axisColor },
        axisTicks: { show: false },
      },
      yaxis: {
        ...this.chartOptions.yaxis,
        labels: {
          ...this.chartOptions.yaxis?.labels,
          style: { colors: axisColor },
          formatter: (value: number) => {
            if (value == null) return '';
            return value + '%';
          },
        },
      },
      legend: {
        ...this.chartOptions.legend,
        labels: { colors: axisColor },
      },
      grid: {
        borderColor: gridColor,
      },
      tooltip: {
        theme: isDark ? 'dark' : 'light',
      },
    };

    if (this.viewReady && this.chart) {
      this.chart.updateOptions(
        {
          xaxis: {
            labels: { style: { colors: axisColor } },
          },
          yaxis: {
            labels: { style: { colors: axisColor } },
          },
          legend: {
            labels: { colors: axisColor },
          },
          grid: {
            borderColor: gridColor,
          },
          tooltip: {
            theme: isDark ? 'dark' : 'light',
          },
        },
        true,
        true,
      );
    }
  }

  ngOnChanges() {
    const data = this.monthlyData || [];

    const allMonths = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const months =
      data.length === 12
        ? data.map((m, i) => m.monthName || allMonths[i])
        : data.map((m) => m.monthName || allMonths[0]);

    const totalAmount = data.map((m) => m.totalAmount ?? 0);
    const receivedAmount = data.map((m) => m.receivedAmount ?? 0);
    const dueAmount = data.map((m) => m.dueAmount ?? 0);

    this.chartOptions = {
      ...this.chartOptions,
      series: [
        { name: 'Total Amount', data: totalAmount },
        { name: 'Received Amount', data: receivedAmount },
        { name: 'Due Amount', data: dueAmount },
      ],
      xaxis: {
        ...this.chartOptions.xaxis,
        categories: months,
      },
    };

    if (this.viewReady && this.chart) {
      this.chart.updateSeries(this.chartOptions.series as any);
      this.chart.updateOptions({
        xaxis: { categories: months },
      });
    }
  }

  ngAfterViewInit() {
    this.viewReady = true;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
