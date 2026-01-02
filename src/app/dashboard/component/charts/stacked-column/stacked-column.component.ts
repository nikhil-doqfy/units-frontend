import { Component, Input, ViewChild } from '@angular/core';
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
  NgApexchartsModule,
} from 'ng-apexcharts';

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
  colors?: string[];
};

@Component({
  selector: 'app-stacked-column-chart',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './stacked-column.component.html',
  styleUrl: './stacked-column.component.css',
})
export class StackedColumnChartComponent {
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  @Input() monthlyData: any[] = [];
  constructor() {
    this.chartOptions = {
      series: [
        {
          name: 'Credit Card',
          data: [
            180000, 220000, 180000, 180000, 180000, 180000, 180000, 180000,
            180000, 180000, 180000, 180000,
          ],
        },
        {
          name: 'Debit Card',
          data: [
            100000, 140000, 100000, 100000, 100000, 100000, 100000, 100000,
            100000, 100000, 100000, 100000,
          ],
        },
        {
          name: 'Net Banking',
          data: [
            50000, 90000, 50000, 50000, 50000, 50000, 50000, 50000, 50000,
            50000, 50000, 50000,
          ],
        },
      ],
      chart: {
        type: 'bar',
        height: 240,
        stacked: true,
        toolbar: {
          show: false,
        },
      },
      colors: ['#2C7AFF', '#FF7105', '#00BEDB'],
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: {
              position: 'bottom',
              offsetX: -10,
              offsetY: 0,
            },
          },
        },
      ],
      plotOptions: {
        bar: {
          borderRadius: 2,
          borderRadiusApplication: 'end',
          borderRadiusWhenStacked: 'last',
          horizontal: false,
        },
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
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      dataLabels: {
        enabled: false,
      },
      yaxis: {
        min: 100000,
        max: 500000,
        labels: {
          formatter: (value) => 'AED ' + value.toLocaleString('en-IN'),
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      fill: {
        opacity: 1,
      },
      legend: {
        position: 'top',
        offsetX: 0,
        offsetY: 0,
        markers: {
          size: 8,
          height: 8,
          radius: 8,
        } as any,
        labels: {
          colors: '#344046',
        },
      },
    };
  }

  ngOnChanges() {
    if (!this.monthlyData.length) return;

    this.chartOptions = {
      series: [
        {
          name: 'Credit Card',
          data: this.monthlyData.map((d) => d.credit_card),
        },
        { name: 'Debit Card', data: this.monthlyData.map((d) => d.debit_card) },
        {
          name: 'Net Banking',
          data: this.monthlyData.map((d) => d.net_banking),
        },
      ],
      chart: {
        type: 'bar',
        height: 240,
        stacked: true,
        toolbar: { show: false },
      },
      colors: ['#2C7AFF', '#FF7105', '#00BEDB'],
      xaxis: {
        categories: this.monthlyData.map(
          (d) =>
            [
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
            ][d.month - 1]
        ),
      },
      dataLabels: { enabled: false },
      fill: { opacity: 1 },
      legend: { position: 'top' },
    };
  }
}
