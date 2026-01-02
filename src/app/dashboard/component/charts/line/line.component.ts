import { Component, Input, OnChanges } from '@angular/core';
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexStroke,
  ApexMarkers,
  ApexDataLabels,
  ApexYAxis,
  ApexLegend,
  ApexGrid,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  markers: ApexMarkers;
  dataLabels: ApexDataLabels;
  yaxis: ApexYAxis;
  legend: ApexLegend;
  grid: ApexGrid;
  colors?: string[];
};

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './line.component.html',
  styleUrls: ['./line.component.css'],
})
export class LineChartComponent implements OnChanges {
  @Input() monthlyData: {
    monthName: string;
    totalAmount: number;
    receivedAmount: number;
    dueAmount: number;
  }[] = [];
  chartOptions: Partial<ChartOptions> = {
    series: [
      {
        name: 'Total Amount',
        data: [60, 95, 70, 50, 90, 72],
      },

      {
        name: 'Received Amount',
        data: [30, 75, 100, 50, 45, 90],
      },
      {
        name: 'Due Amount',
        data: [100, 50, 20, 45, 25, 80],
      },
    ],
    chart: {
      type: 'line',
      height: 220,
      toolbar: { show: false },
      zoom: {
        enabled: false,
      },

      animations: {
        enabled: false,
      },
    },
    stroke: {
      width: 3,
      curve: 'smooth',
    },
    markers: {
      size: 4,
      hover: { size: 6 },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 4,
    },
    colors: ['#1988FD', '#00B7AD', '#4B9C5E'],
    legend: {
      position: 'top',
      horizontalAlign: 'center',
      formatter: function (seriesName: string, opts: any) {
        const data = opts.w.globals.series[opts.seriesIndex];
        const total = data.reduce((a: number, b: number) => a + b, 0);
        const percent = Math.round((total / 600) * 100);
        return `${seriesName}   ${percent}%`;
      },
      labels: {
        colors: '#344046',
      },
    },
    grid: {
      strokeDashArray: 0,
    },
  };

  //   ngOnChanges() {
  //     if (!this.monthlyData) return;

  //     const months = this.monthlyData.monthly_data.map((m: any) => m.month_str);
  //     const totalAmount = this.monthlyData.monthly_data.map(
  //       (m: any) => m.total_amount
  //     );
  //     const receivedAmount = this.monthlyData.monthly_data.map(
  //       (m: any) => m.received_amount
  //     );
  //     const dueAmount = this.monthlyData.monthly_data.map(
  //       (m: any) => m.due_amount
  //     );

  //     this.chartOptions = {
  //       ...this.chartOptions,
  //       series: [
  //         { name: 'Total Amount', data: totalAmount },
  //         { name: 'Received Amount', data: receivedAmount },
  //         { name: 'Due Amount', data: dueAmount },
  //       ],
  //       xaxis: {
  //         categories: months,
  //       },
  //     };
  //   }
  // }

  ngOnChanges() {
    if (this.monthlyData) {
    }

    const months = this.monthlyData.map((m) => m.monthName);

    const totalAmount = this.monthlyData.map((m) => m.totalAmount);

    const receivedAmount = this.monthlyData.map((m) => m.receivedAmount);

    const dueAmount = this.monthlyData.map((m) => m.dueAmount);

    this.chartOptions = {
      ...this.chartOptions,
      series: [
        { name: 'Total Amount', data: totalAmount },
        { name: 'Received Amount', data: receivedAmount },
        { name: 'Due Amount', data: dueAmount },
      ],
      xaxis: {
        categories: months,
      },
    };
  }
}
