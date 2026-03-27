import {
  Component,
  Input,
  OnChanges,
  AfterViewInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { NgApexchartsModule, ChartComponent } from 'ng-apexcharts';

@Component({
  selector: 'app-revenue-bar-chart',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './revenue-bar-chart.component.html',
  styleUrl: './revenue-bar-chart.component.css',
})
export class RevenueBarChartComponent implements OnChanges, AfterViewInit {
  @Input() data: { name: string; value: number }[] = [];
  @Input() xAxisTitle: string = 'Block / Tower';
  @ViewChild('chart') chartRef?: ChartComponent;

  private viewReady = false;

  chartOptions: any = {
    series: [{ name: 'Revenue', data: [] }],
    chart: {
      type: 'bar',
      height: 260,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    legend: { show: false },
    plotOptions: {
      bar: { columnWidth: '40%', distributed: true },
    },
    colors: ['#0B63E6'],
    dataLabels: { enabled: false },
    xaxis: {
      categories: [],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        rotate: -35,
        rotateAlways: true,
        offsetY: -2,
        style: { fontSize: '11px', colors: '#6b7280' },
      },
      title: {
        text: this.xAxisTitle,
        offsetY: -28,
        style: { fontSize: '12px', fontWeight: 600, color: '#030507' },
      },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => `AED ${val.toLocaleString('en-IN')}`,
      },
    },
    tooltip: {
      custom: ({ series, seriesIndex, dataPointIndex }: any) => `
        <div style="
          padding:12px;
          background:#fff;
          border-radius:12px;
          box-shadow:0 6px 18px rgba(0,0,0,.15);
        ">
          <strong style="font-size:16px">
            AED ${series[seriesIndex][dataPointIndex].toLocaleString()}
          </strong>
          <div style="font-size:12px;color:#6b7280;margin-top:4px">
            Revenue Received
          </div>
        </div>
      `,
    },
    responsive: [
      {
        breakpoint: 768,
        options: { plotOptions: { bar: { columnWidth: '55%' } } },
      },
      {
        breakpoint: 480,
        options: {
          chart: { height: 240 },
          plotOptions: { bar: { columnWidth: '65%' } },
        },
      },
    ],
  };

  ngAfterViewInit() {
    this.viewReady = true;
    if (this.data.length) this.applyData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] || changes['xAxisTitle']) {
      if (this.viewReady) {
        this.applyData();
      }
    }
  }

  private applyData() {
    const categories = this.data.map(d => d.name);
    const values     = this.data.map(d => d.value);
    const colors     = this.data.map(() => '#0B63E6');

    const opts = {
      series:  [{ name: 'Revenue', data: values }],
      xaxis:   {
        categories,
        title: {
          text: this.xAxisTitle,
          offsetY: -28,
          style: { fontSize: '12px', fontWeight: 600, color: '#030507' },
        },
      },
      colors,
    };

    if (this.chartRef) {
      this.chartRef.updateOptions(opts, false, false);
    } else {
      this.chartOptions = { ...this.chartOptions, ...opts };
    }
  }
}
