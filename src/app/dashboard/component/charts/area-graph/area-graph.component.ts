import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
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

export interface AreaGraphData {
  month: string;
  amount_received: number;
  cheque_bounce: number;
  total_amount: number;
}

@Component({
  selector: 'app-area-graph',
  standalone: true,
  imports: [NgApexchartsModule, CommonModule],
  templateUrl: './area-graph.component.html',
  styleUrl: './area-graph.component.css',
})
export class AreaGraphComponent implements OnChanges, AfterViewInit {
  @Input() data: AreaGraphData[] = [];

  @ViewChild('chart') chart!: ChartComponent;

  private viewReady = false;

  private static readonly MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  public chartOptions: ChartOptions = this.buildOptions([], []);

  ngAfterViewInit() {
    this.viewReady = true;
    if (this.data?.length) this.applyToChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data?.length) {
      const received = this.data.map(d => d.amount_received);
      const total    = this.data.map(d => d.total_amount);
      this.chartOptions = this.buildOptions(received, total);
      if (this.viewReady) this.applyToChart();
    }
  }

  private applyToChart() {
    if (!this.chart) return;
    this.chart.updateSeries([
      { name: 'Amount Received', data: this.data.map(d => d.amount_received) },
      { name: 'Total Amount',    data: this.data.map(d => d.total_amount) },
    ]);
  }

  private buildOptions(received: number[], total: number[]): ChartOptions {
    return {
      series: [
        { name: 'Amount Received', data: received },
        { name: 'Total Amount',    data: total },
      ],
      chart: { type: 'area', height: 350, stacked: false, toolbar: { show: false }, zoom: { enabled: false } },
      colors: ['#43A047', '#FF7043'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2 },
      markers: { size: 3 },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.65,
          opacityTo: 0.08,
          stops: [0, 85, 100],
        },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'center',
        markers: { shape: 'square' } as any,
      },
      xaxis: { categories: AreaGraphComponent.MONTHS },
      yaxis: {
        min: 0,
        forceNiceScale: true,
        floating: false,
        labels: {
          formatter: (val: number) => 'AED ' + val.toLocaleString('en-IN'),
        },
        axisBorder: { show: false },
        axisTicks:  { show: false },
      },
    };
  }
}
