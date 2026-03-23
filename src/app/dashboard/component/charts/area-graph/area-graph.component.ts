import { NgApexchartsModule } from 'ng-apexcharts';
import { Component, ViewChild } from '@angular/core';

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

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  yaxis: ApexYAxis;
  colors: string[];
  legend: ApexLegend;
  fill: ApexFill;
  stroke?: any;
  markers?: any;
};
@Component({
  selector: 'app-area-graph',
  standalone: true,
  imports: [NgApexchartsModule, CommonModule],
  templateUrl: './area-graph.component.html',
  styleUrl: './area-graph.component.css',
})
export class AreaGraphComponent {
  // @ViewChild('chart') chart!: ChartComponent;
  // public chartOptions: ChartOptions = {} as ChartOptions;

  // constructor() {
  //   const baseDate = new Date('01 Jan 2024');

  //   this.chartOptions = {
  //     series: [
  //       {
  //         name: 'Amount Received',
  //         data: this.generateMonthlyData(12, {
  //           min: 500000,
  //           max: 1000000,
  //         }),
  //       },
  //       {
  //         name: 'Cheque Bounce',
  //         data: this.generateMonthlyData(12, {
  //           min: 50000,
  //           max: 200000,
  //         }),
  //       },
  //       {
  //         name: 'Total Amount',
  //         data: this.generateMonthlyData(12, {
  //           min: 600000,
  //           max: 1200000,
  //         }),
  //       },
  //     ],

  //     chart: {
  //       type: 'area',
  //       height: 350,
  //       stacked: false,
  //     },
  //     colors: ['#00E396', '#FF4560', '#008FFB'],
  //     dataLabels: {
  //       enabled: false,
  //     },
  //     fill: {
  //       type: 'gradient',
  //       gradient: {
  //         shadeIntensity: 1,
  //         opacityFrom: 0.7,
  //         opacityTo: 0.1,
  //         stops: [0, 90, 100],
  //       },
  //     },
  //     stroke: {
  //       curve: 'smooth',
  //       width: 3,
  //     },
  //     legend: {
  //       position: 'top',
  //       horizontalAlign: 'center',
  //       markers: {
  //         shape: 'square',
  //       },
  //     },
  //     xaxis: {
  //       categories: [
  //         'Jan',
  //         'Feb',
  //         'Mar',
  //         'Apr',
  //         'May',
  //         'Jun',
  //         'Jul',
  //         'Aug',
  //         'Sep',
  //         'Oct',
  //         'Nov',
  //         'Dec',
  //       ],
  //     },
  //     yaxis: {
  //       min: 0,
  //       labels: {
  //         formatter: (val: number) => {
  //           if (val === undefined || val === null) return '';
  //           return `AED ${val.toLocaleString('en-IN')}`;
  //         },
  //       },
  //     },
  //   };
  // }

  // generateMonthlyData(
  //   count: number,
  //   yrange: { min: number; max: number },
  // ): number[] {
  //   let series: number[] = [];

  //   for (let i = 0; i < count; i++) {
  //     let y =
  //       Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;

  //     series.push(y);
  //   }

  //   return series;
  // }
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions: ChartOptions = {} as ChartOptions;

  constructor() {
    this.chartOptions = {
      series: [
        {
          name: 'Amount Received',
          data: this.generateData(12, 500000, 1000000),
        },
        {
          name: 'Cheque Bounce',
          data: this.generateData(12, 50000, 200000),
        },
        {
          name: 'Total Amount',
          data: this.generateData(12, 600000, 1200000),
        },
      ],

      chart: {
        type: 'area',
        height: 350,
        stacked: false,
      },

      colors: ['#00E396', '#FF4560', '#008FFB'],

      dataLabels: {
        enabled: false,
      },

      stroke: {
        curve: 'smooth',
        width: 3,
      },

      markers: {
        size: 4,
      },

      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.3,
          opacityTo: 0.05,
          stops: [0, 90, 100],
        },
      },

      legend: {
        position: 'top',
        horizontalAlign: 'center',
      },

      xaxis: {
        categories: [
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
        ],
      },

      yaxis: {
        min: 100000,
        forceNiceScale: true,
        floating: false,
        labels: {
          formatter: (val: number) => {
            return `AED ${val.toLocaleString('en-IN')}`;
          },
        },
      },
    };
  }

  generateData(count: number, min: number, max: number): number[] {
    let arr: number[] = [];
    for (let i = 0; i < count; i++) {
      arr.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return arr;
  }
}
