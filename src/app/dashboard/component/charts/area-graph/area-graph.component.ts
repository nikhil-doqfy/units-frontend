import { Component } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-area-graph',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './area-graph.component.html',
  styleUrl: './area-graph.component.css',
})
export class AreaGraphComponent {
  chartOptions: any = {
    series: [
      {
        name: 'Amount Received',
        data: [
          380000, 390000, 370000, 360000, 350000, 370000, 360000, 350000,
          380000, 390000, 420000, 480000,
        ],
      },
      {
        name: 'Total Amount',
        data: [
          420000, 430000, 410000, 400000, 390000, 410000, 400000, 390000,
          420000, 430000, 460000, 500000,
        ],
      },
    ],

    chart: {
      type: 'area',
      height: 300,
      toolbar: { show: false },
      zoom: { enabled: false },
      clipPadding: 10,
    },
    legend: {
      // show: true,
      position: 'top',
      horizontalAlign: 'center',
      floating: true, // 👈 graph container मध्येच राहील
      offsetY: -5,
      markers: {
        width: 10,
        height: 10,
        radius: 0,
      },
    },

    stroke: {
      curve: 'smooth',
      width: [3, 3],
      colors: ['#16a34a', '#2563eb'], // green + blue
    },

    fill: {
      type: ['gradient', 'solid'],
      gradient: {
        shade: 'light',
        type: 'horizontal',
        shadeIntensity: 0.6,
        gradientToColors: ['#fb923c', '#22c55e'],
        opacityFrom: 0.6,
        opacityTo: 0.6,
        stops: [0, 100, 100],
      },
    },

    colors: ['#16a34a', '#2563eb'],

    markers: {
      shape: 'square',
      size: 0,
      hover: { size: 6 },
    },

    dataLabels: { enabled: false },

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
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '11px',
        },
      },
    },

    yaxis: {
      min: 100000,
      labels: {
        formatter: (val: number) => {
          if (val === undefined || val === null) return '';
          return `AED ${val.toLocaleString('en-IN')}`;
        },
      },
    },

    grid: {
      borderColor: '#f1f5f9',
      // strokeDashArray: 4,
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
            Amount Received
          </div>
        </div>
      `,
    },

    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: { height: 260 },
        },
      },
      {
        breakpoint: 480,
        options: {
          chart: { height: 240 },
        },
      },
    ],
  };
}
