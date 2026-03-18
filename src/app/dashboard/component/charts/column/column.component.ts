import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { OnChanges, SimpleChanges } from '@angular/core';
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
  NgApexchartsModule,
} from 'ng-apexcharts';

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
  styleUrl: './column.component.css',
})
export class ColumnChartComponent implements OnChanges, AfterViewInit {
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  @Input() data: { name: string; value: number }[] = [];
  constructor() {
    this.chartOptions = {
      series: [
        {
          name: 'My-series',
          data: [],
        },
      ],
      chart: {
        height: 212,
        type: 'bar',
        toolbar: {
          show: false,
        },
      },
      colors: ['#2C7AFF'],
      plotOptions: {
        bar: {
          borderRadius: 2,
          horizontal: false,
        },
      },
      title: {
        text: '',
        align: 'left',
      },
      xaxis: {
        categories: [],
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      dataLabels: {
        enabled: false,
      },
      yaxis: {
        labels: {
          formatter: (value) => 'AED ' + value.toLocaleString('en-IN'),
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      fill: {
        opacity: 1,
      },
    };
  }
  // ngOnChanges(changes: SimpleChanges): void {
  //   if (changes['data'] && this.data?.length) {
  //     this.chartOptions.series = [
  //       {
  //         name: 'My-series',
  //         data: this.data.map((d) => d.value),
  //       },
  //     ];

  //     this.chartOptions.xaxis = {
  //       ...this.chartOptions.xaxis,
  //       categories: this.data.map((d) => d.name),
  //     };
  //   }

  ngAfterViewInit() {
    if (this.data?.length) {
      this.updateChart();
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data?.length) {
      this.updateChart();
    }
  }
  private updateChart() {
    const values = this.data.map((d) => d.value);
    const categories = this.data.map((d) => d.name);

    this.chart.updateSeries([
      {
        name: 'My-series',
        data: values,
      },
    ]);

    this.chart.updateOptions(
      {
        xaxis: {
          categories,
        },
      },

      true,
    );
  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   if (changes['data'] && this.data?.length && this.chart) {
  //     const values = this.data.map((d) => d.value);
  //     const categories = this.data.map((d) => d.name);

  //     this.chart.updateOptions(
  //       {
  //         series: [
  //           {
  //             name: 'My-series',
  //             data: values,
  //           },
  //         ],
  //         xaxis: {
  //           categories: categories,
  //         },
  //       },
  //       true,
  //     );
  //   }
  // }
}
