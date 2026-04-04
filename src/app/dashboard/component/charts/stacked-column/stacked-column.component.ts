import { Component, Input, OnChanges, ViewChild } from '@angular/core';
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
  ApexTooltip,
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
  tooltip: ApexTooltip;
  colors?: string[];
};

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

@Component({
  selector: 'app-stacked-column-chart',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './stacked-column.component.html',
  styleUrl: './stacked-column.component.css',
})
export class StackedColumnChartComponent implements OnChanges {
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  @Input() monthlyData: any[] = [];

  constructor() {
    this.chartOptions = this._buildOptions([], [], [], []);
  }

  ngOnChanges(): void {
    const data = this.monthlyData || [];
    if (!data.length) return;

    const cheque       = data.map((d) => d.cheque        ?? 0);
    const cash         = data.map((d) => d.cash          ?? 0);
    const bankTransfer = data.map((d) => d.bank_transfer ?? 0);
    const pdc          = data.map((d) => d.pdc           ?? 0);
    const months       = data.map((d) => d.month_str || MONTH_LABELS[(d.month ?? 1) - 1]);

    this.chartOptions = this._buildOptions(cheque, cash, bankTransfer, pdc, months);
  }

  private _buildOptions(
    cheque: number[],
    cash: number[],
    bankTransfer: number[],
    pdc: number[],
    months: string[] = MONTH_LABELS,
  ): Partial<ChartOptions> {
    const allValues = [...cheque, ...cash, ...bankTransfer, ...pdc];
    const maxVal    = allValues.length ? Math.max(...allValues) : 0;
    const yMax      = maxVal > 0 ? Math.ceil(maxVal * 1.2 / 1000) * 1000 : 10000;

    return {
      series: [
        { name: 'Cheque',        data: cheque       },
        { name: 'Cash',          data: cash         },
        { name: 'Bank Transfer', data: bankTransfer },
        { name: 'PDC',           data: pdc          },
      ],
      chart: {
        type: 'bar',
        height: 240,
        stacked: true,
        toolbar: { show: false },
        animations: { enabled: false },
      },
      colors: ['#2C7AFF', '#FF7105', '#00BEDB', '#7C3AED'],
      plotOptions: {
        bar: {
          borderRadius: 2,
          borderRadiusApplication: 'end',
          borderRadiusWhenStacked: 'last',
          horizontal: false,
        },
      },
      xaxis: {
        categories: months,
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        min: 0,
        max: yMax,
        labels: {
          formatter: (val: number) => 'AED ' + val.toLocaleString(),
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      dataLabels: { enabled: false },
      fill: { opacity: 1 },
      tooltip: {
        y: { formatter: (val: number) => 'AED ' + val.toLocaleString() },
      },
      legend: {
        position: 'top',
        offsetX: 0,
        offsetY: 0,
        markers: { size: 8, height: 8, radius: 8 } as any,
        labels: { colors: '#344046' },
      },
      responsive: [
        {
          breakpoint: 480,
          options: { legend: { position: 'bottom', offsetX: -10, offsetY: 0 } },
        },
      ],
    };
  }
}
