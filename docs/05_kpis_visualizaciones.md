KPI 1. Total de delitos registrados

Representa el número total de registros de delitos incluidos en el conjunto de datos.

Sumando las frecuencias que proporcionaste, obtienes 1.401.293 registros.

Es importante mostrar el período al que corresponde esa cifra. Si tus datos abarcan desde 2001 hasta la actualidad, debes indicar que es un acumulado histórico, no el número de delitos ocurridos en el último año.

KPI 2. Tipo de delito más frecuente

El delito más frecuente es THEFT, con 308.148 registros.

Representa aproximadamente el 21,99 % del total.

Este indicador permite identificar rápidamente qué categoría tiene mayor presencia en el conjunto de datos.

KPI 3. Porcentaje de delitos contra la propiedad

Puedes agrupar categorías como THEFT, BURGLARY, MOTOR VEHICLE THEFT y CRIMINAL DAMAGE para estudiar los delitos relacionados con bienes y propiedades.

No obstante, debes definir una clasificación coherente antes de calcularlo: no todas las categorías tienen necesariamente una correspondencia directa con una clasificación jurídica de delitos contra la propiedad.

KPI 4. Variación de los delitos respecto al período anterior

Mide el cambio porcentual en el número de delitos entre dos períodos comparables.

Por ejemplo, compara los delitos registrados en 2025 con los de 2024:
\[
\text{Variación (\%)} =
\frac{\text{Delitos}_{2025}-\text{Delitos}_{2024}}
{\text{Delitos}\_{2024}}\times100
\]
Este KPI todavía no puede calcularse con la tabla de frecuencias que compartiste, porque necesitamos los registros desglosados por fecha.

Además, conviene llamarlo «variación de delitos registrados», ya que una variación en los registros no demuestra necesariamente un cambio equivalente en la criminalidad real.

---

Delitos por día Promedio de registros diarios en un período Fecha y número de delitos

---

Delitos por cada 100.000 habitantes Incidencia relativa respecto a la población Delitos y población por zona y período

---

Zona con mayor número de delitos Área con más registros durante el período seleccionado

---

### A. Distribución por tipo de delito

Un gráfico de barras horizontales con los diez tipos más frecuentes. Permite comparar las categorías sin saturar el dashboard.

### B. Evolución temporal de los delitos

Un gráfico de líneas con el número de delitos por mes o año. Podrías incorporar filtros por tipo de delito, período y ubicación.

### C. Distribución geográfica

Un mapa de Chicago que muestre la concentración espacial de los registros. Puedes utilizar zonas, distritos o coordenadas, según la calidad de los datos disponibles.

### D. Distribución temporal por hora y día de la semana

Un mapa de calor con los días de la semana en un eje y las horas del día en el otro. Permite identificar patrones temporales y comparar las categorías de delitos.

## predecir qué delitos aumentarán

Esta opción combina predicción y análisis de tendencias.

En lugar de predecir solamente el total de delitos, el sistema podría estimar el volumen mensual futuro de las principales categorías y clasificarlas según su variación esperada.

Por ejemplo, la aplicación podría presentar una tabla como esta:
Tipo de delito Variación prevista Tendencia
THEFT +5 % Aumento
BATTERY -2 % Disminución
MOTOR VEHICLE THEFT +8 % Aumento

Los valores son ilustrativos.

Este enfoque puede ser más interesante para el usuario porque permite identificar qué categorías podrían aumentar o disminuir. Sin embargo, hay que distinguir entre un aumento previsto y un aumento estadísticamente significativo: una variación pequeña podría deberse al ruido de la serie temporal.

Para implementarlo, entrenarías o ajustarías modelos de series temporales para las categorías seleccionadas y compararías las predicciones con sus respectivos valores históricos.

---

# KPIs de CrimeBI

## 1. KPIs descriptivos y estratégicos (visión general)

Son métricas macro que permiten al usuario comprender el volumen total y la composición de la criminalidad en el período seleccionado.

### 1.1. Volumen total de incidentes registrados (\(N\))

- **Descripción:** Conteo total de registros en la base de datos para el período de corte (por ejemplo, más de 1.000.000 de registros entre enero de 2021 y septiembre de 2026).
- **Utilidad:** Muestra la escala de datos que procesa el ETL y la infraestructura de almacenamiento de CrimeBI.

### 1.3. Proporción de delitos violentos frente a no violentos

- **Descripción:** Distribución porcentual de los incidentes según una clasificación agrupada durante el ETL.
- **Clasificación inicial propuesta:**
  - **Violentos:** `ROBBERY`, `ASSAULT`, `BATTERY`, `HOMICIDE`.
  - **No violentos:** `THEFT`, `BURGLARY`, `NARCOTICS`.
- **Utilidad:** Permite analizar la composición de la criminalidad registrada según la categoría asignada.

> **Nota metodológica:** La clasificación anterior es una propuesta inicial y no debe considerarse una clasificación jurídica definitiva. Conviene establecer criterios documentados y contemplar categorías adicionales, como los delitos de violencia sexual y los delitos con armas. También es preferible utilizar una tercera categoría, «Otros o no clasificados», para evitar excluir registros.

## 2. KPIs operacionales y espacio-temporales (análisis geoespacial)

Aportan valor al permitir analizar las dimensiones geográficas (`Beat`, `District` y `Community Area`) y temporales, en consonancia con los aspectos considerados en el marco teórico, como los abordados por Wang et al. (2019).

### 2.1. Concentración de incidentes por distrito o zona (_Hotspot Index_)

- **Descripción:** Identificación de los cinco distritos o zonas comunitarias con mayor número de incidentes registrados durante el período seleccionado.
- **Utilidad:** Facilita la exploración de las diferencias geográficas sin asumir que la criminalidad se distribuye uniformemente por toda la ciudad.

### 2.2. Proporción de robos y agresiones con armas

- **Descripción:** Porcentaje de incidentes de robo y agresión que presentan evidencia registrada de uso de armas.
- **Fórmula propuesta:**

\[
\text{Proporción de incidentes con armas (\%)} =
\frac{\text{Incidentes de robo y agresión con armas}}
{\text{Total de incidentes de robo y agresión}} \times 100
\]

- **Utilidad:** Permite analizar la presencia de armas en determinadas categorías delictivas y estudiar su distribución temporal y geográfica.

> **Nota metodológica:** No conviene identificar el uso de armas únicamente buscando la palabra `ARMED` en el campo `description` sin verificar los valores disponibles. Es necesario definir qué categorías y descripciones representan efectivamente incidentes con armas. Si el conjunto de datos no permite determinarlo con suficiente fiabilidad, debe documentarse esta limitación.

### 2.3. Tasa de arrestos por tipo de delito (_Arrest Rate by Primary Type_)

- **Descripción:** Porcentaje de registros asociados a un arresto para cada categoría de delito.
- **Ejemplos de comparación:** `THEFT`, `ROBBERY` y `ASSAULT`.
- **Fórmula:**

\[
\text{Tasa de arrestos por categoría (\%)} =
\frac{\text{Registros de la categoría con } Arrest = True}
{\text{Total de registros de la categoría}} \times 100
\]

- **Utilidad:** Permite comparar las proporciones de registros asociados a arrestos entre categorías delictivas e identificar diferencias en los datos observados.

> **Nota metodológica:** Esta métrica no equivale a una tasa de resolución de casos ni demuestra por sí sola la efectividad policial. Las diferencias pueden estar relacionadas con las características de los incidentes, las prácticas de registro y otros factores.
