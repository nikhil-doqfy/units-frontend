import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  OnInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexPlotOptions,
  ApexResponsive,
  ApexXAxis,
  ApexLegend,
  ApexFill,
  ApexYAxis,
  ApexTooltip,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';
import { ThemeService } from '../../../../theme.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xaxis: ApexXAxis;
  yaxis?: ApexYAxis;
  legend: ApexLegend;
  fill: ApexFill;
  tooltip: ApexTooltip;
  colors?: string[];
};

const MONTH_LABELS = [
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

@Component({
  selector: 'app-stacked-column-chart',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './stacked-column.component.html',
  styleUrl: './stacked-column.component.css',
})
export class StackedColumnChartComponent
  implements OnChanges, AfterViewInit, OnDestroy
{
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  private destroy$ = new Subject<void>();
  private viewReady = false;
  @Input() monthlyData: any[] = [];

  constructor(private themeService: ThemeService) {
    this.chartOptions = this._buildOptions([], [], [], []);
  }

  ngOnInit() {
    this.themeService.isDarkMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isDark) => {
        this.applyTheme(isDark);
      });
  }
  ngOnChanges(): void {
    const data = this.monthlyData || [];
    if (!data.length) return;

    const cheque = data.map((d) => d.cheque ?? 0);
    const cash = data.map((d) => d.cash ?? 0);
    const bankTransfer = data.map((d) => d.bank_transfer ?? 0);
    const pdc = data.map((d) => d.pdc ?? 0);
    const months = data.map(
      (d) => d.month_str || MONTH_LABELS[(d.month ?? 1) - 1],
    );

    this.chartOptions = this._buildOptions(
      cheque,
      cash,
      bankTransfer,
      pdc,
      months,
    );
    // ✅ re-apply theme after data update
    this.themeService.isDarkMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isDark) => {
        this.applyTheme(isDark);
      });
  }

  private applyTheme(isDark: boolean) {
    const axisColor = isDark ? '#FFFFFF' : '#344046';
    const gridColor = isDark ? '#2c2c2c' : '#e0e0e0';

    this.chartOptions = {
      ...this.chartOptions,
      xaxis: {
        ...this.chartOptions.xaxis,
        labels: {
          style: { colors: axisColor },
        },
      },
      yaxis: {
        ...this.chartOptions.yaxis,
        labels: {
          style: { colors: axisColor },
        },
      },
      legend: {
        ...this.chartOptions.legend,
        labels: {
          colors: axisColor,
        },
      },
      tooltip: {
        ...this.chartOptions.tooltip,
        theme: isDark ? 'dark' : 'light',
      },
    };

    // live update chart (important)
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
          tooltip: {
            theme: isDark ? 'dark' : 'light',
          },
        },
        true,
        true,
      );
    }
  }
  private _buildOptions(
    cheque: number[],
    cash: number[],
    bankTransfer: number[],
    pdc: number[],
    months: string[] = MONTH_LABELS,
  ): Partial<ChartOptions> {
    const allValues = [...cheque, ...cash, ...bankTransfer, ...pdc];
    const maxVal = allValues.length ? Math.max(...allValues) : 0;
    const yMax = maxVal > 0 ? Math.ceil((maxVal * 1.2) / 1000) * 1000 : 10000;

    return {
      series: [
        { name: 'Cheque', data: cheque },
        { name: 'Cash', data: cash },
        { name: 'Bank Transfer', data: bankTransfer },
        { name: 'PDC', data: pdc },
      ],
      chart: {
        type: 'bar',
        height: 240,
        stacked: true,
        toolbar: { show: false },
        animations: { enabled: false },
      },
      colors: ['#2C7AFF', '#FF7105', '#00BEDB', '#7C3AED'],
      plotOptions: {
        bar: {
          borderRadius: 2,
          borderRadiusApplication: 'end',
          borderRadiusWhenStacked: 'last',
          horizontal: false,
        },
      },
      xaxis: {
        categories: months,
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        min: 0,
        max: yMax,
        labels: {
          formatter: (val: number) => `AED ${val.toLocaleString()}`,
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      dataLabels: { enabled: false },
      fill: { opacity: 1 },
      tooltip: {
        y: { formatter: (val: number) => 'AED ' + val.toLocaleString() },
      },
      legend: {
        position: 'top',
        offsetX: 0,
        offsetY: 0,
        markers: { size: 8, height: 8, radius: 8 } as any,
        labels: { colors: '#344046' },
      },
      responsive: [
        {
          breakpoint: 480,
          options: { legend: { position: 'bottom', offsetX: -10, offsetY: 0 } },
        },
      ],
    };
  }
  ngAfterViewInit() {
    this.viewReady = true;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
