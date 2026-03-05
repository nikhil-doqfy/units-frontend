import { Component, EventEmitter, Output } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
@Component({
  selector: 'app-revenue-bar-chart',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './revenue-bar-chart.component.html',
  styleUrl: './revenue-bar-chart.component.css',
})
export class RevenueBarChartComponent {
  @Output() barClick = new EventEmitter<any>();

  chartOptions: any = {
    series: [
      {
        name: 'Revenue',
        data: [
          380000, 350000, 310000, 380000, 300000, 350000, 370000, 420000,
          190000, 260000, 190000, 300000,
        ],
      },
    ],

    chart: {
      type: 'bar',
      height: 260,
      toolbar: { show: false },
    },
    legend: {
      show: false,
    },

    plotOptions: {
      bar: {
        columnWidth: '40%',
        distributed: true,
      },
    },

    colors: [
      '#0B63E6',
      '#0B63E6',
      '#0B63E6',
      '#0B63E6',
      '#0B63E6',
      '#0B63E6',
      '#0B63E6',
      '#0B63E6',
      '#FF7A00',
      '#0B63E6',
      '#FF7A00',
      '#0B63E6',
    ],

    dataLabels: { enabled: false },

    xaxis: {
      categories: [
        'T1',
        'T2',
        'T3',
        'T4',
        'T5',
        'T6',
        'T7',
        'T8',
        'T9',
        'T10',
        'T11',
        'T12',
      ],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        rotate: -35,
        rotateAlways: true,
        offsetY: -2,
        style: {
          fontSize: '11px',
          colors: '#6b7280',
        },
      },
      title: {
        text: 'Block / Tower',
        offsetY: -28,
        style: {
          fontSize: '12px',
          fontWeight: 600,
          color: '#030507',
        },
      },
    },

    yaxis: {
      min: 100000,
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
          <div style="font-size:12px;color:#6b7280">JAN – DEC 2025</div>
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
        options: {
          plotOptions: {
            bar: { columnWidth: '55%' },
          },
        },
      },
      {
        breakpoint: 480,
        options: {
          chart: { height: 240 },
          plotOptions: {
            bar: { columnWidth: '65%' },
          },
        },
      },
    ],
  };
}
