"use client"

import React from "react"
import {
  Activity,
  TrendingUp,
  Package,
  DollarSign,
  ShoppingCart,
  Eye,
  MoreHorizontal,
} from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashboardStats, ProductSales, SalesByDate } from "../../types/ventas"
import { useDashboard } from "../../hooks/useVentas"


// Configuración de colores
const chartConfig = {
  revenue: {
    label: "Ingresos",
    color: "#dc2626",
    icon: DollarSign,
  },
} satisfies ChartConfig

// Componente para las 3 métricas principales
const MetricsCards = ({ data }: { data: DashboardStats | null }) => {
  if (!data) return null

  const { summary } = data

  const metrics = [
    {
      title: "Total Órdenes",
      value: summary.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      description: "órdenes completadas",
      trend: "+12.5%",
      trendUp: true,
    },
    {
      title: "Ingresos Totales",
      value: `$${summary.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: "en ventas",
      trend: "+8.2%",
      trendUp: true,
    },
    {
      title: "Productos Vendidos",
      value: summary.totalProductsSold.toLocaleString(),
      icon: Package,
      description: "unidades vendidas",
      trend: "+15.3%",
      trendUp: true,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      {metrics.map((metric, index) => (
        <Card
          key={index}
          className="border border-gray-200 hover:shadow-lg transition-shadow"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {metric.title}
            </CardTitle>
            <metric.icon className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black mb-1">
              {metric.value}
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <span
                className={`inline-flex items-center gap-1 font-medium ${
                  metric.trendUp ? "text-green-600" : "text-red-600"
                }`}
              >
                <TrendingUp className="h-3 w-3" />
                {metric.trend}
              </span>
              <span className="ml-1">{metric.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Componente del gráfico principal
const RevenueAreaChart = ({ data }: { data: DashboardStats | null }) => {
  const chartData = React.useMemo(() => {
    if (!data?.sales) return []

    const dateMap = new Map<string, { month: string; revenue: number }>()

    data.sales.forEach((sale: ProductSales) => {
      sale.salesByDate.forEach((dateEntry: SalesByDate) => {
        const date = new Date(dateEntry.date)
        const month = date.toLocaleDateString("es-ES", { month: "short" })

        if (!dateMap.has(month)) {
          dateMap.set(month, { month, revenue: 0 })
        }

        const entry = dateMap.get(month)!
        const avgPrice = sale.totalRevenue / sale.totalQuantity
        entry.revenue += dateEntry.quantity * avgPrice
      })
    })

    return Array.from(dateMap.values()).sort((a, b) => {
      const months = [
        "ene",
        "feb",
        "mar",
        "abr",
        "may",
        "jun",
        "jul",
        "ago",
        "sep",
        "oct",
        "nov",
        "dic",
      ]
      return months.indexOf(a.month) - months.indexOf(b.month)
    })
  }, [data])

  if (!data?.sales || chartData.length === 0) {
    return (
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="h-64 flex items-center justify-center text-gray-500">
            No hay datos suficientes para mostrar el gráfico
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalGrowth =
    chartData.length > 1
      ? ((chartData[chartData.length - 1].revenue - chartData[0].revenue) /
          chartData[0].revenue) *
        100
      : 0

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-black">
          <Activity className="h-5 w-5" />
          Evolución de Ingresos
        </CardTitle>
        <CardDescription>
          Ingresos mensuales del período seleccionado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="#f1f5f9"
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "#64748b", fontSize: 12 }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value) => [
                    `$${Number(value).toLocaleString()}`,
                    "Ingresos",
                  ]}
                />
              }
            />
            <Area
              dataKey="revenue"
              type="step"
              fill="#dc2626"
              fillOpacity={0.2}
              stroke="#dc2626"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              {totalGrowth >= 0 ? "Crecimiento" : "Decrecimiento"} de{" "}
              {Math.abs(totalGrowth).toFixed(1)}% este período
              <TrendingUp
                className={`h-4 w-4 ${
                  totalGrowth >= 0 ? "text-green-600" : "text-red-600"
                }`}
              />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Basado en {chartData.length} meses de datos
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

// Tabla de productos
const ProductsTable = ({ data }: { data: DashboardStats | null }) => {
  if (!data?.sales || data.sales.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">
            No hay productos para mostrar
          </p>
        </CardContent>
      </Card>
    )
  }

  const sortedProducts = [...data.sales].sort(
    (a, b) => b.totalRevenue - a.totalRevenue
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-black">
          <Package className="h-5 w-5" />
          Productos por Rendimiento
        </CardTitle>
        <CardDescription>
          Lista completa de productos ordenados por ingresos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Cantidad Vendida</TableHead>
              <TableHead>Ingresos</TableHead>
              <TableHead>Precio Promedio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProducts.map((product) => {
              const avgPrice = product.totalRevenue / product.totalQuantity
              const isTopSeller =
                product.totalRevenue >
                data.summary.totalRevenue / data.sales.length

              return (
                <TableRow key={product.productId}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="text-black">{product.productName}</span>
                      <span className="text-xs text-gray-500">
                        ID: {product.productId.substring(0, 8)}...
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {product.totalQuantity}
                      </span>
                      <span className="text-xs text-gray-500">unidades</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-green-600">
                      ${product.totalRevenue.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-600">
                      ${avgPrice.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={isTopSeller ? "default" : "secondary"}
                      className={isTopSeller ? "bg-red-600 text-white" : ""}
                    >
                      {isTopSeller ? "Top Seller" : "Regular"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() =>
                            navigator.clipboard.writeText(product.productId)
                          }
                        >
                          Copiar ID del producto
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Ver historial de ventas
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Mostrando {sortedProducts.length} de {sortedProducts.length} productos
        </div>
      </CardFooter>
    </Card>
  )
}

// Componente principal
export function DashboardCharts() {
  const { data, loading, error, refreshData } = useDashboard()

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton para las 3 cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="animate-pulse"
            >
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Loading skeleton para el gráfico */}
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-80 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
        {/* Loading skeleton para la tabla */}
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600 font-medium">
              Error al cargar los datos
            </p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
            <button
              onClick={refreshData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No hay datos disponibles</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">Dashboard de Ventas</h1>
          <p className="text-gray-600">
            Resumen de rendimiento y análisis de productos
          </p>
        </div>
        <button
          onClick={refreshData}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Activity className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {/* 3 Cards de métricas */}
      <MetricsCards data={data} />

      {/* Gráfico de área */}
      <RevenueAreaChart data={data} />

      {/* Tabla de productos */}
      <ProductsTable data={data} />
    </div>
  )
}
