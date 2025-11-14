import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { NgApexchartsModule, ApexChart, ApexNonAxisChartSeries, ApexResponsive, ApexDataLabels, ApexLegend, ApexTooltip, ApexFill, ApexStroke, ApexPlotOptions } from "ng-apexcharts";

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
};

@Component({
  selector: 'app-donut-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './donut.component.html',
  styleUrls: ['./donut.component.css']
})
export class DonutChartComponent {

  @Input() vacancy = 88;
  @Input() occupied = 12;

  selectedMode: 'vacancy' | 'occupied' | 'both' = 'vacancy';

  chartOptions: Partial<ChartOptions> = {
    series: [0],
  };

  ngOnInit() {
    this.updateChart();
  }

  changeMode(mode: 'vacancy' | 'occupied' | 'both') {
    this.selectedMode = mode;
    this.updateChart();
  }

  updateChart() {
    let series: ApexNonAxisChartSeries;
    let colors: string[];
    let labels: string[];
    let chartHeight: number;

    if (this.selectedMode === 'vacancy') {
      series = [this.vacancy, 100 - this.vacancy];
      colors = ['#3D7BFF', '#EFEFEF'];
      labels = ['Vacancy', 'Remaining'];
      chartHeight = 240;
    }
    else if (this.selectedMode === 'occupied') {
      series = [this.occupied, 100 - this.occupied];
      colors = ['#FF8A41', '#EFEFEF'];
      labels = ['Occupied', 'Remaining'];
      chartHeight = 240;
    }
    else {
      series = [this.vacancy, this.occupied];
      colors = ['#3D7BFF', '#FF8A41'];
      labels = ['Vacancy', 'Occupied'];
      chartHeight = 220;
    }

    this.chartOptions = {
      series,
      labels,
      colors,
      chart: {
        type: "donut",
        height: chartHeight
      },
      plotOptions: {
        pie: {
          donut: {
            size: "50%",
            labels: {
              show: true,
              total: {
                show: true,
                label: "",
                fontSize: "16px",
                formatter: () =>
                  this.selectedMode === 'vacancy'
                    ? `${this.vacancy}%`
                    : this.selectedMode === 'occupied'
                      ? `${this.occupied}%`
                      : `${100}%`
              }
            }
          }
        }
      },
      stroke: {
        width: 0
      },
      dataLabels: { enabled: false },
      legend: {
        show: this.selectedMode === 'both',
        formatter: (seriesName: string, opts: any) => {
          const value = opts.w.globals.series[opts.seriesIndex];
          return `${seriesName} - ${value}%`;
        }
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val}%`
        }
      }
    };
  }
}
