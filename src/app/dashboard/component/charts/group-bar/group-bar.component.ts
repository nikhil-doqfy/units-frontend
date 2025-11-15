import { Component, ViewChild } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexXAxis,
  ApexPlotOptions,
  ApexStroke,
  ApexTitleSubtitle,
  ApexYAxis,
  ApexTooltip,
  ApexFill,
  ApexGrid,
  ApexLegend,
  NgApexchartsModule,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  tooltip: ApexTooltip;
  fill: ApexFill;
  legend: ApexLegend;
  grid: ApexGrid;
  colors?: string[];
};

@Component({
  selector: 'app-group-bar-chart',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './group-bar.component.html',
  styleUrl: './group-bar.component.css',
})
export class GroupBarChartComponent {
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  constructor() {
    this.chartOptions = {
      colors: ['#1988FD', '#00C9D7'],

      series: [
        {
          name: 'Owner',
          data: [780, 456, 890, 789, 456, 345, 800],
        },
        {
          name: 'Third Party',
          data: [670, 390, 290, 249, 790, 249, 123],
        },
      ],
      chart: {
        type: 'bar',
        height: 240,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          borderRadius: 2,
          borderRadiusApplication: 'end',
          borderRadiusWhenStacked: 'last',
          horizontal: true,
          barHeight: '85%',
          dataLabels: {
            position: 'right',
          },
        },
      },
      grid: {
        show: false,
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (val: number) => `${val}`,
        },
      },
      stroke: {
        width: 1,
        colors: ['#fff'],
      },
      title: {
        text: '',
        align: 'left',
      },
      xaxis: {
        categories: [
          'Unit 1',
          'Unit 2',
          'Unit 3',
          'Unit 4',
          'Unit 5',
          'Unit 6',
          'Unit 7',
        ],
        labels: {
          show: false,
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      dataLabels: {
        enabled: true,
        offsetX: 10,
        style: {
          fontSize: '10px',
          colors: ['#445860'],
        },
      },
      yaxis: {
        title: {
          text: undefined,
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
}
