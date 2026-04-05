import { Component, Input, OnChanges, ViewChild } from '@angular/core';
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
  ApexTooltip,
  ChartComponent,
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
  tooltip: ApexTooltip;
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
  @ViewChild('chart') chart!: ChartComponent;

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

  ngOnChanges() {
    const data = this.monthlyData || [];

    const allMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const months = data.length === 12
      ? data.map((m, i) => m.monthName || allMonths[i])
      : data.map((m) => m.monthName || allMonths[0]);

    const totalAmount    = data.map((m) => m.totalAmount    ?? 0);
    const receivedAmount = data.map((m) => m.receivedAmount ?? 0);
    const dueAmount      = data.map((m) => m.dueAmount      ?? 0);

    const monthsWithData = data.filter((m) => (m.totalAmount ?? 0) > 0);
    const totalPct    = monthsWithData.length > 0 ? 100 : 0;
    const receivedPct = monthsWithData.length
      ? Math.round(monthsWithData.reduce((a, m) => a + (m.receivedAmount ?? 0), 0) / monthsWithData.length)
      : 0;
    const duePct = monthsWithData.length ? 100 - receivedPct : 0;

    this.chartOptions = {
      chart: {
        type: 'line',
        height: 220,
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { enabled: false },
      },
      stroke: { width: 3, curve: 'smooth' },
      markers: { size: 4, hover: { size: 6 } },
      dataLabels: { enabled: false },
      colors: ['#1988FD', '#00B7AD', '#FF6B35'],
      series: [
        { name: `Total Amount`, data: totalAmount },
        { name: `Received Amount`, data: receivedAmount },
        { name: `Due Amount`, data: dueAmount },
      ],
      xaxis: { categories: months },
      yaxis: {
        min: 0,
        max: 100,
        tickAmount: 4,
        labels: { formatter: (val: number) => `${val}%` },
      },
      tooltip: {
        y: { formatter: (val: number) => `${val}%` },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'center',
        formatter: (_name: string, opts: any) => {
          const pcts = [totalPct, receivedPct, duePct];
          const names = ['Total Amount', 'Received Amount', 'Due Amount'];
          return `${names[opts.seriesIndex]}   ${pcts[opts.seriesIndex]}%`;
        },
        labels: { colors: '#344046' },
      },
      grid: { strokeDashArray: 0 },
    };
  }
}
