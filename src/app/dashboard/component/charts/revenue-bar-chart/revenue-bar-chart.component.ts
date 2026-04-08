import {
  Component,
  Input,
  OnChanges,
  AfterViewInit,
  SimpleChanges,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';
import { ThemeService } from '../../../../theme.service';

@Component({
  selector: 'app-revenue-bar-chart',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './revenue-bar-chart.component.html',
  styleUrl: './revenue-bar-chart.component.css',
})
export class RevenueBarChartComponent
  implements OnChanges, AfterViewInit, OnDestroy
{
  @Input() data: { name: string; value: number }[] = [];
  @Input() xAxisTitle: string = 'Property';
  @ViewChild('chart') chart!: ChartComponent;
  private destroy$ = new Subject<void>();
  private viewReady = false;
  private isDark = false;
  constructor(private themeService: ThemeService) {}
  chartOptions: any = {
    series: [{ name: 'Revenue', data: [] }],
    chart: {
      type: 'bar',
      height: 260,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    legend: { show: false },
    plotOptions: {
      bar: { columnWidth: '40%', distributed: true },
    },
    colors: ['#0B63E6'],
    dataLabels: { enabled: false },
    xaxis: {
      categories: [],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        rotate: -35,
        rotateAlways: true,
        offsetY: -2,
        style: { fontSize: '11px', colors: '#6b7280' },
      },
      title: {
        text: 'Property',
        offsetY: -28,
        style: { fontSize: '12px', fontWeight: 600, color: '#030507' },
      },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => `AED ${val.toLocaleString('en-IN')}`,
      },
    },
    tooltip: {
      custom: ({ series, seriesIndex, dataPointIndex }: any) => `
        <div style="
          padding:12px;
          background:#fff;
          border-radius:12px;
          box-shadow:0 6px 18px rgba(0,0,0,.15);
        ">
          <strong style="font-size:16px">
            AED ${series[seriesIndex][dataPointIndex].toLocaleString()}
          </strong>
          <div style="font-size:12px;color:#6b7280;margin-top:4px">Revenue Received</div>
        </div>
      `,
    },
    responsive: [
      {
        breakpoint: 768,
        options: { plotOptions: { bar: { columnWidth: '55%' } } },
      },
      {
        breakpoint: 480,
        options: {
          chart: { height: 240 },
          plotOptions: { bar: { columnWidth: '65%' } },
        },
      },
    ],
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] || changes['xAxisTitle']) {
      const values = (this.data || []).map((d) => d.value);
      const categories = (this.data || []).map((d) => d.name);
      const colors = (this.data || []).map(() => '#0B63E6');

      // Update bound options so the chart renders correctly even before view is ready
      this.chartOptions = {
        ...this.chartOptions,
        series: [{ name: 'Revenue', data: values }],
        colors,
        xaxis: {
          ...this.chartOptions.xaxis,
          categories,
          title: {
            ...this.chartOptions.xaxis.title,
            text: this.xAxisTitle,
          },
        },
      };

      if (this.viewReady) {
        this.applyToChart();
      }
    }
  }

  ngOnInit() {
    const theme = localStorage.getItem('theme');
    const isDark = theme === 'dark';

    this.themeService.setDarkMode(isDark);

    this.themeService.isDarkMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isDark) => {
        this.isDark = isDark;
        const axisColor = isDark ? '#FFFFFF' : '#000000';
        const gridColor = isDark ? '#ffffff14' : '#0000001a';

        // ✅ Update base chart options
        this.chartOptions = {
          ...this.chartOptions,
          xaxis: {
            ...this.chartOptions.xaxis,
            labels: {
              ...this.chartOptions.xaxis.labels,
              style: { fontSize: '11px', colors: axisColor },
            },
            title: {
              ...this.chartOptions.xaxis.title,
              style: {
                fontSize: '12px',
                fontWeight: 600,
                color: axisColor,
              },
            },
          },
          yaxis: {
            ...this.chartOptions.yaxis,
            labels: {
              formatter: (val: number) => `AED ${val.toLocaleString('en-IN')}`,
              style: { colors: axisColor },
            },
          },
          grid: {
            show: true,
            borderColor: gridColor,
          },
        };

        // ✅ Live update after chart render
        if (this.viewReady && this.chart) {
          this.chart.updateOptions(
            {
              xaxis: {
                labels: { style: { colors: axisColor } },
                title: { style: { color: axisColor } },
              },
              yaxis: {
                labels: { style: { colors: axisColor } },
              },
              grid: { borderColor: gridColor },
            },
            true,
            true,
          );
        }
      });
  }
  private applyToChart() {
    if (!this.chart) return;

    const values = (this.data || []).map((d) => d.value);
    const categories = (this.data || []).map((d) => d.name);
    const colors = (this.data || []).map(() => '#0B63E6');

    const axisColor = this.isDark ? '#FFFFFF' : '#000000';
    const gridColor = this.isDark ? '#ffffff14' : '#0000001a';

    this.chart.updateSeries([{ name: 'Revenue', data: values }]);

    this.chart.updateOptions(
      {
        colors,
        xaxis: {
          categories,
          labels: {
            rotate: -35,
            rotateAlways: true,
            style: { colors: axisColor },
          },
          title: {
            text: this.xAxisTitle,
            style: { color: axisColor },
          },
        },
        yaxis: {
          labels: {
            style: { colors: axisColor },
          },
        },
        grid: {
          show: true,
          borderColor: gridColor, // 🔥 THIS FIXES YOUR ISSUE
        },
      },
      true,
      true,
    );
  }
  ngAfterViewInit() {
    this.viewReady = true;
    if (this.data?.length) {
      this.applyToChart();
    }
  }

  // ✅ MEMORY SAFE
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
