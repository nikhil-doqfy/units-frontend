import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexYAxis,
  ApexLegend,
  ApexFill,
} from 'ng-apexcharts';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ThemeService } from '../../../../theme.service';

export type ChartOptions = {
  series: any;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  yaxis: ApexYAxis;
  colors: string[];
  legend: ApexLegend;
  fill: ApexFill;
  stroke?: any;
  markers?: any;
  grid?: any;
};

export interface AreaGraphData {
  month: string;
  amount_received: number;
  cheque_bounce: number;
  total_amount: number;
}

@Component({
  selector: 'app-area-graph',
  standalone: true,
  imports: [NgApexchartsModule, CommonModule],
  templateUrl: './area-graph.component.html',
  styleUrl: './area-graph.component.css',
})
export class AreaGraphComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() data: AreaGraphData[] = [];

  @ViewChild('chart') chart!: ChartComponent;

  private viewReady = false;
  private destroy$ = new Subject<void>();
  private isDark = false; // ✅ theme state

  constructor(private themeService: ThemeService) {}

  private static readonly MONTHS = [
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

  public chartOptions: ChartOptions = this.buildOptions([], []);

  // ✅ THEME HANDLE
  ngOnInit() {
    const theme = localStorage.getItem('theme');
    this.isDark = theme === 'dark';

    this.themeService.setDarkMode(this.isDark);

    this.themeService.isDarkMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isDark) => {
        this.isDark = isDark;

        const axisColor = isDark ? '#FFFFFF' : '#000000';
        const gridColor = isDark ? '#ffffff14' : '#0000001a';

        this.chartOptions = {
          ...this.chartOptions,
          xaxis: {
            ...this.chartOptions.xaxis,
            labels: { style: { colors: axisColor } },
          },
          yaxis: {
            ...this.chartOptions.yaxis,
            labels: {
              formatter: (val: number) => 'AED ' + val.toLocaleString('en-IN'),
              style: { colors: axisColor },
            },
          },
          legend: {
            ...this.chartOptions.legend,
            labels: { colors: axisColor },
          },
          grid: {
            show: true,
            borderColor: gridColor,
          },
        };

        // 🔥 reapply (tab switch fix)
        if (this.viewReady) {
          this.applyToChart();
        }
      });
  }

  ngAfterViewInit() {
    this.viewReady = true;
    if (this.data?.length) this.applyToChart();
    this.applyToChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data?.length) {
      const received = this.data.map((d) => d.amount_received);
      const total = this.data.map((d) => d.total_amount);

      this.chartOptions = this.buildOptions(received, total);

      if (this.viewReady) this.applyToChart();
    }
  }

  // ✅ MAIN FIX (grid + theme reapply)
  private applyToChart() {
    if (!this.chart) return;

    const axisColor = this.isDark ? '#FFFFFF' : '#000000';
    const gridColor = this.isDark ? '#ffffff14' : '#0000001a';

    this.chart.updateSeries([
      {
        name: 'Amount Received',
        data: this.data.map((d) => d.amount_received),
      },
      {
        name: 'Total Amount',
        data: this.data.map((d) => d.total_amount),
      },
    ]);

    this.chart.updateOptions(
      {
        xaxis: {
          categories: AreaGraphComponent.MONTHS,
          labels: { style: { colors: axisColor } },
        },
        yaxis: {
          labels: { style: { colors: axisColor } },
        },
        legend: {
          labels: { colors: axisColor },
        },
        grid: {
          show: true,
          borderColor: gridColor, // ✅ important fix
        },
      },
      true,
      true,
    );
  }

  // ✅ DEFAULT OPTIONS
  private buildOptions(received: number[], total: number[]): ChartOptions {
    return {
      series: [
        { name: 'Amount Received', data: received },
        { name: 'Total Amount', data: total },
      ],
      chart: {
        type: 'area',
        height: 350,
        stacked: false,
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      colors: ['#43A047', '#FF7043'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2 },
      markers: { size: 3 },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.65,
          opacityTo: 0.08,
          stops: [0, 85, 100],
        },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'center',
        markers: { shape: 'square' } as any,
      },
      xaxis: {
        categories: AreaGraphComponent.MONTHS,
      },
      yaxis: {
        min: 0,
        forceNiceScale: true,
        labels: {
          formatter: (val: number) => 'AED ' + val.toLocaleString('en-IN'),
        },
      },
      grid: {
        show: true,
        borderColor: '#0000001a', // ✅ default light
      },
    };
  }

  // ✅ MEMORY SAFE
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
