import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import {
  NgApexchartsModule,
  ApexChart,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexDataLabels,
  ApexLegend,
  ApexTooltip,
  ApexFill,
  ApexStroke,
  ApexPlotOptions,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  legend: ApexLegend;
  tooltip: ApexTooltip;
  fill: ApexFill;
  responsive: ApexResponsive[];
  states?: any;
};

@Component({
  selector: 'app-donut-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, TranslateModule],
  templateUrl: './donut.component.html',
  styleUrls: ['./donut.component.css'],
})
export class DonutChartComponent {
 // @Input() vacancy = 88;
  // @Input() occupied = 12;

  // selectedMode: 'vacancy' | 'occupied' | 'both' = 'vacancy';

  // chartOptions: Partial<ChartOptions> = {
  //   series: [0],
  // };

  // ngOnInit() {
  //   this.updateChart();
  // }
  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes['vacancy'] || changes['occupied']) {
  //     this.updateChart();
  //   }
  // }

  // changeMode(mode: 'vacancy' | 'occupied' | 'both') {
  //   this.selectedMode = mode;
  //   this.updateChart();
  // }

  // updateChart() {
  //   let series: ApexNonAxisChartSeries;
  //   let colors: string[];
  //   let labels: string[];
  //   let chartHeight: number;

  //   if (this.selectedMode === 'vacancy') {
  //     series = [this.vacancy, 100 - this.vacancy];
  //     colors = ['#3D7BFF', '#EFEFEF'];
  //     labels = ['Vacancy', 'Remaining'];
  //     chartHeight = 240;
  //   } else if (this.selectedMode === 'occupied') {
  //     series = [this.occupied, 100 - this.occupied];
  //     colors = ['#FF8A41', '#EFEFEF'];
  //     labels = ['Occupied', 'Remaining'];
  //     chartHeight = 240;
  //   } else {
  //     series = [this.vacancy, this.occupied];
  //     colors = ['#3D7BFF', '#FF8A41'];
  //     labels = ['Vacancy', 'Occupied'];
  //     chartHeight = 220;
  //   }

  //   this.chartOptions = {
  //     series,
  //     labels,
  //     colors,
  //     chart: {
  //       type: 'donut',
  //       height: chartHeight,
  //     },
  //     plotOptions: {
  //       pie: {
  //         donut: {
  //           size: '50%',
  //           labels: {
  //             show: true,
  //             total: {
  //               show: true,
  //               label: '',
  //               fontSize: '16px',
  //               formatter: () =>
  //                 this.selectedMode === 'vacancy'
  //                   ? `${this.vacancy}%`
  //                   : this.selectedMode === 'occupied'
  //                   ? `${this.occupied}%`
  //                   : `${100}%`,
  //             },
  //           },
  //         },
  //       },
  //     },
  //     stroke: {
  //       width: 0,
  //     },
  //     dataLabels: { enabled: false },
  //     legend: {
  //       show: this.selectedMode === 'both',
  //       formatter: (seriesName: string, opts: any) => {
  //         const value = opts.w.globals.series[opts.seriesIndex];
  //         return `${seriesName} - ${value}%`;
  //       },
  //     },
  //     tooltip: {
  //       y: {
  //         formatter: (val: number) => `${val}%`,
  //       },
  //     },
  //   };
  // }
  @Input() vacancy = 88;
  @Input() occupied = 12;

  selectedMode: 'vacancy' | 'occupied' | 'both' = 'vacancy';

  chartOptions: Partial<ChartOptions> = {
    series: [0],
  };

  private observer!: MutationObserver;

  ngOnInit() {
    this.updateChart();

    this.observer = new MutationObserver(() => {
      this.updateChart();
    });

    this.observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  ngOnDestroy() {
    this.observer.disconnect();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['vacancy'] || changes['occupied']) {
      this.updateChart();
    }
  }

  changeMode(mode: 'vacancy' | 'occupied' | 'both') {
    this.selectedMode = mode;
    this.updateChart();
  }

  updateChart() {
    const isDark = document.body.classList.contains('dark-theme');

    const textColor = isDark ? '#ffffff' : '#000000';

    let series: ApexNonAxisChartSeries;
    let colors: string[];
    let labels: string[];
    let chartHeight: number;

    if (this.selectedMode === 'vacancy') {
      series = [this.vacancy, 100 - this.vacancy];
      colors = ['#3D7BFF', '#EFEFEF'];
      labels = ['Vacancy', 'Remaining'];
      chartHeight = 240;
    } else if (this.selectedMode === 'occupied') {
      series = [this.occupied, 100 - this.occupied];
      colors = ['#FF8A41', '#EFEFEF'];
      labels = ['Occupied', 'Remaining'];
      chartHeight = 240;
    } else {
      if (this.vacancy === 0 && this.occupied === 0) {
        series = [1];
        colors = ['#E0E0E0'];
        labels = ['No Data'];
      } else {
        series = [this.vacancy, this.occupied];
        colors = ['#3D7BFF', '#FF8A41'];
        labels = ['Vacancy', 'Occupied'];
      }

      chartHeight = 220;
    }

    this.chartOptions = {
      series,
      labels,
      colors,
      chart: {
        type: 'donut',
        height: chartHeight,
      },

      states: {
        hover: {
          filter: {
            type: 'none',
          },
        },
        active: {
          filter: {
            type: 'none',
          },
        },
      },
      fill: {
        opacity: 1,
      },
      plotOptions: {
        pie: {
          expandOnClick: false,

          donut: {
            size: '50%',
            labels: {
              show: true,

              value: {
                color: textColor,
                fontSize: '18px',
                fontWeight: 600,
              },

              total: {
                show: true,
                label: '',
                color: textColor,
                fontSize: '16px',
                formatter: () => {
                  if (this.vacancy === 0 && this.occupied === 0) {
                    return '0%';
                  }

                  if (this.selectedMode === 'vacancy') {
                    return `${this.vacancy}%`;
                  }

                  if (this.selectedMode === 'occupied') {
                    return `${this.occupied}%`;
                  }

                  return `${this.vacancy + this.occupied}%`;
                },
              },
            },
          },
        },
      },

      stroke: {
        width: 0,
      },

      dataLabels: { enabled: false },

      legend: {
        show: this.selectedMode === 'both',
        labels: {
          colors: textColor,
        },
        formatter: (seriesName: string, opts: any) => {
          const value = opts.w.globals.series[opts.seriesIndex];
          return `${seriesName} - ${value}%`;
        },
      },

     // tooltip: {
      //   theme: isDark ? 'dark' : 'light',
      //   y: {
      //     formatter: (val: number) => `${val}%`,
      //   },
      // },
      tooltip: {
        custom: ({ series, seriesIndex, w }) => {
          const label = w?.globals?.labels?.[seriesIndex] || '';
          const value = series?.[seriesIndex] ?? 0;

          const isDark = document.body.classList.contains('dark-theme');

          if (this.vacancy === 0 && this.occupied === 0) {
            return `
        <div class="donut-tooltip-fix ${isDark ? 'dark' : ''}">
          <span class="tooltip-title">No Data</span>
          <span class="tooltip-value">0%</span>
        </div>
      `;
          }

          return `
      <div class="donut-tooltip-fix ${isDark ? 'dark' : ''}">
        <span class="tooltip-title">${label}</span>
        <span class="tooltip-value">${value}%</span>
      </div>
    `;
        },
      },
    };
  }
}
