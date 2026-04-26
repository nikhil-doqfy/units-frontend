import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { OnChanges, SimpleChanges } from '@angular/core';
import {
  ApexAxisChartSeries,
  ChartComponent,
  ApexDataLabels,
  ApexChart,
  ApexPlotOptions,
  ApexXAxis,
  ApexFill,
  ApexYAxis,
  ApexTitleSubtitle,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { ThemeService } from '../../../../theme.service';
import { Subject, takeUntil } from 'rxjs';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  yaxis?: ApexYAxis;
  title: ApexTitleSubtitle;
  colors?: string[];
  fill: ApexFill;
  theme?: any;
  grid?: any;
  tooltip?: ApexTooltip | any;
};

@Component({
  selector: 'app-column-chart',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './column.component.html',
  styleUrl: './column.component.css',
})
export class ColumnChartComponent
  implements OnChanges, OnDestroy, AfterViewInit
{
  @ViewChild('chart') chart!: ChartComponent;

  @Input() data: { name: string; value: number }[] = [];

  public chartOptions: Partial<ChartOptions>;

  private destroy$ = new Subject<void>();
  private viewReady = false;

  constructor(private themeService: ThemeService) {
    this.chartOptions = {
      series: [{ name: 'My-series', data: [] }],
      chart: {
        height: 212,
        type: 'bar',
        toolbar: { show: false },
      },
      colors: ['#2C7AFF'],
      tooltip: {
        theme: false,
      },

      plotOptions: {
        bar: {
          borderRadius: 2,
          horizontal: false,
        },
      },
      xaxis: {
        categories: [],
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          formatter: (value) => 'AED ' + value.toLocaleString('en-IN'),
        },
      },
      dataLabels: { enabled: false },
      fill: { opacity: 1 },
    };
  }

  ngOnInit() {
    const theme = localStorage.getItem('theme');
    const isDark = theme === 'dark';

    this.themeService.setDarkMode(isDark);

    this.themeService.isDarkMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isDark) => {
        const axisColor = isDark ? '#FFFFFF' : '#000000';
        const gridColor = isDark ? '#e8e1e114' : '#0000001a';

        this.chartOptions = {
          ...this.chartOptions,
          xaxis: {
            ...this.chartOptions.xaxis,
            labels: { style: { colors: axisColor } },
          },
          yaxis: {
            ...this.chartOptions.yaxis,
            labels: {
              style: { colors: axisColor },
              formatter: (value) => 'AED ' + value.toLocaleString('en-IN'),
            },
          },
          grid: {
            show: true,
            borderColor: gridColor,
            strokeDashArray: 0,
            position: 'back',
          },
        };

        if (this.viewReady && this.chart) {
          this.chart.updateOptions(
            {
              xaxis: { labels: { style: { colors: axisColor } } },
              yaxis: { labels: { style: { colors: axisColor } } },
              grid: { borderColor: gridColor },
            },
            true,
            true,
          );
        }
      });
  }

  ngOnChanges() {
    if (this.data?.length) {
      const values = this.data.map((d) => d.value);
      const categories = this.data.map((d) => d.name);

      this.chartOptions = {
        ...this.chartOptions,
        series: [{ name: 'My-series', data: values }],
        xaxis: { ...this.chartOptions.xaxis, categories },
      };

      if (this.viewReady && this.chart) {
        this.chart.updateSeries([{ name: 'My-series', data: values }]);
        this.chart.updateOptions({ xaxis: { categories } }, true);
      }
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
