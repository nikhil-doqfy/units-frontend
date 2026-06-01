import { Component } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexDataLabels,
  ApexLegend,
  ApexPlotOptions,
  ApexGrid,
  ApexTooltip,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { HomeService } from '../../../services/home.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  plotOptions: ApexPlotOptions;
  grid: ApexGrid;
  tooltip: ApexTooltip;
  colors: string[];
};
@Component({
  selector: 'app-group-bar-chart',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './group-bar.component.html',
  styleUrl: './group-bar.component.css',
})
export class GroupBarChartComponent {
  constructor(private homeService: HomeService) {}

  properties: any[] = [];

  totalRecords = 0;

  chartSeries: ApexAxisChartSeries = [];

  chartCategories: string[] = [];

  private readonly maxCategoryLabelLength = 13;

  private formatCategoryLabel = (value: any): string => {
    const label = `${value ?? ''}`;

    if (label.length <= this.maxCategoryLabelLength) {
      return label;
    }

    return `${label.slice(0, this.maxCategoryLabelLength)}...`;
  };

  private getYAxisMax(data: any[]): number {
    const maxValue = data.reduce((max, property) => {
      const rentedUnits = Number(property.rented_units) || 0;
      const vacantUnits = Number(property.vacant_units) || 0;

      return Math.max(max, rentedUnits + vacantUnits);
    }, 0);

    return Math.max(20, Math.ceil(maxValue / 20) * 20);
  }

  get summary() {
    return {
      totalProperties: this.totalRecords,

      totalRented: this.properties.reduce((sum, p) => sum + p.rented_units, 0),

      totalVacant: this.properties.reduce((sum, p) => sum + p.vacant_units, 0),
    };
  }

  chartOptions: Partial<ChartOptions> = {
    chart: {
      type: 'bar',
      height: 245,
      stacked: true,
      parentHeightOffset: 0,
      toolbar: {
        show: false,
      },
    },

    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '40%',
        borderRadius: 6,
      },
    },

    dataLabels: {
      enabled: false,
    },

    grid: {
      show: true,
      borderColor: '#e5e7eb',
      strokeDashArray: 0,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },

    tooltip: {
      enabled: true,
      x: {
        formatter: (value: any) => `${value ?? ''}`,
      },
    },

    xaxis: {
      categories: [],
      labels: {
        rotate: -35,
        rotateAlways: true,
        trim: true,
        maxHeight: 60,
        formatter: this.formatCategoryLabel,
        style: {
          fontSize: '11px',
        },
      },
      tooltip: {
        enabled: true,
      },
    },

    yaxis: {
      min: 0,
      max: 20,
      tickAmount: 1,
      labels: {
        formatter: (value: number) => `${Math.round(value)}`,
      },
    },

    colors: ['#2C7AFF', '#00BEDB'],

    legend: {
      position: 'top',
      horizontalAlign: 'center',
    },
  };

  currentPage = 1;
  totalPages = 1;
  limit = 5;

  ngOnInit(): void {
    this.getDashboardPropertyOwned();
  }

  getDashboardPropertyOwned(): void {
    const params = {
      page: this.currentPage,
      limit: this.limit,
    };

    this.homeService.getDashboardPropertyOwned(params).subscribe({
      next: (res: any) => {
        const content = res?.content;
        const data = content?.properties ?? [];

        this.totalPages = content?.pagination?.total_pages ?? 1;
        this.totalRecords = content?.pagination?.total_records ?? 0;

        this.properties = [...data];

        // chart update
        this.chartCategories = data.map((x: any) => x.property_name);

        this.chartSeries = [
          {
            name: 'Rented Units',
            data: data.map((x: any) => x.rented_units),
          },
          {
            name: 'Vacant Units',
            data: data.map((x: any) => x.vacant_units),
          },
        ];

        setTimeout(() => {
          const yAxisMax = this.getYAxisMax(data);

          this.chartSeries = [...this.chartSeries];
          this.chartCategories = [...this.chartCategories];
          this.chartOptions = {
            ...this.chartOptions,
            xaxis: {
              ...this.chartOptions.xaxis,
              categories: this.chartCategories,
            },
            yaxis: {
              ...this.chartOptions.yaxis,
              min: 0,
              max: yAxisMax,
              tickAmount: yAxisMax / 20,
            },
          };
        }, 0);
      },

      error: (err) => {
        console.error('API error:', err);
      },
    });
  }
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getDashboardPropertyOwned();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getDashboardPropertyOwned();
    }
  }
}
