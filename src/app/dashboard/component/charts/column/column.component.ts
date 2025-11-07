import { Component, Input, ViewChild } from "@angular/core";

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
  NgApexchartsModule
} from "ng-apexcharts";


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
};

@Component({
  selector: 'app-column-chart',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './column.component.html',
  styleUrl: './column.component.css'
})
export class ColumnChartComponent {
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  constructor() {
    this.chartOptions = {
      series: [
        {
          name: "My-series",
          data: [370000, 360000, 310000, 370000, 300000, 360000, 370000, 420000, 280000, 330000, 400000, 220000]
        }
      ],
      chart: {
        height: 212,
        type: "bar",
        toolbar: {
          show: false
        },
      },
      colors: ["#2C7AFF"],
      plotOptions: {
        bar: {
          borderRadius: 2,
          horizontal: false
        }
      },
      title: {
        text: "",
        align: "left"
      },
      xaxis: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      dataLabels: {
        enabled: false
      },
      yaxis: {
        min: 100000,
        max: 500000,
        labels: {
          formatter: (value) => "AED " + value.toLocaleString("en-IN")
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      fill: {
        opacity: 1
      }
    };
  }
}