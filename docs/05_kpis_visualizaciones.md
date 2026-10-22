# KPIs de CrimeBI

## 1. Introducción

Los indicadores clave de rendimiento (KPIs) de CrimeBI permiten analizar la criminalidad registrada en Chicago desde tres perspectivas principales: descriptiva, espacio-temporal y predictiva.

Los indicadores descriptivos resumen el volumen y la composición de los delitos registrados. Los indicadores espacio-temporales permiten identificar patrones geográficos y temporales, mientras que los indicadores predictivos buscan estimar la evolución futura de determinadas categorías delictivas.

Los KPIs deben calcularse considerando el período, la ubicación y los filtros seleccionados por el usuario. Además, es necesario documentar las definiciones y limitaciones de cada indicador para evitar interpretaciones incorrectas de los resultados.

# 2. KPIs descriptivos y de composición delictiva

Estos indicadores permiten comprender el volumen general de los registros, identificar las categorías más frecuentes y analizar la composición de los delitos registrados.

## 2.1. Total de delitos registrados

**Descripción:**

Representa el número total de registros de delitos incluidos en el conjunto de datos durante el período seleccionado. Permite conocer el volumen de incidentes registrados y establecer una referencia general para los demás indicadores.

En el análisis inicial, la suma de las frecuencias proporcionadas corresponde a 1.401.293 registros. Esta cifra debe considerarse un valor de referencia de la distribución analizada, no necesariamente el total definitivo de registros de la base de datos.

**Fórmula:**

\[ N = \sum\_{i=1}^{n} 1 \]

Donde:

- \(N\): total de registros.
- \(n\): cantidad de registros que cumplen los filtros aplicados.

En una implementación sobre una tabla de hechos, puede calcularse mediante un conteo de registros o, si existe una clave única y se requiere evitar duplicados, mediante un conteo de identificadores únicos.

**Utilidad:**

- Conocer el volumen de delitos registrados durante un período.
- Comparar el volumen de registros entre períodos.
- Proporcionar contexto para interpretar los demás KPIs.
- Identificar posibles cambios en el volumen de información disponible.

**Consideración metodológica:**

Debe mostrarse el período analizado. Un acumulado histórico desde 2001 no debe presentarse como si representara los delitos ocurridos durante el último año.

Asimismo, es necesario distinguir entre incidentes registrados y delitos efectivamente ocurridos, dado que los registros pueden presentar retrasos, actualizaciones o limitaciones de cobertura.

## 2.2. Tipo de delito más frecuente

**Descripción:**

Identifica la categoría delictiva con mayor número de registros durante el período seleccionado. Permite reconocer qué tipos de delitos tienen mayor presencia en el conjunto de datos.

En la distribución inicial proporcionada, la categoría `THEFT` presenta 308.148 registros, equivalentes aproximadamente al 21,99 % del total de 1.401.293 registros.

**Fórmula:**

\[
\text{Tipo más frecuente} =
\underset{c \in C}{\arg\max}
\left(N_c\right)
\]

Donde:

- \(C\): conjunto de categorías delictivas.
- \(N_c\): número de registros correspondientes a la categoría \(c\).

Para calcular su participación porcentual:

\[
\text{Participación}\_c (\%) =
\frac{N_c}{N} \times 100
\]

**Utilidad:**

- Identificar las categorías delictivas predominantes.
- Priorizar el análisis de los tipos de delitos con mayor volumen de registros.
- Facilitar la comparación entre categorías.
- Proporcionar contexto para el análisis de tendencias y la construcción de modelos predictivos.

**Consideración metodológica:**

El tipo de delito más frecuente puede cambiar según el período y la ubicación seleccionados. Por ello, debe calcularse dinámicamente y no presentarse como un resultado permanente.

## 2.3. Proporción de delitos contra la propiedad

**Descripción:**

Mide la proporción de registros correspondientes a categorías previamente clasificadas como delitos contra la propiedad.

Como clasificación inicial para el análisis, pueden considerarse categorías como `THEFT`, `BURGLARY` y `MOTOR VEHICLE THEFT`. La inclusión de `CRIMINAL DAMAGE` dependerá de los criterios de clasificación adoptados y documentados para el proyecto.

**Fórmula:**

\[
\text{Proporción de delitos contra la propiedad} (\%) =
\frac{\text{Registros clasificados como delitos contra la propiedad}}
{\text{Total de registros clasificados}} \times 100
\]

**Utilidad:**

- Analizar el peso de los delitos relacionados con bienes y propiedades.
- Comparar su participación entre períodos y zonas geográficas.
- Identificar cambios en la composición de los delitos registrados.
- Complementar el análisis de las categorías delictivas más frecuentes.

**Consideración metodológica:**

La clasificación debe definirse antes del cálculo. Las categorías utilizadas en la fuente de datos no necesariamente corresponden de forma directa a una clasificación jurídica.

Para garantizar la consistencia, conviene mantener una tabla de correspondencias entre las categorías originales y los grupos analíticos definidos por CrimeBI.

## 2.4. Proporción de delitos violentos frente a no violentos

**Descripción:**

Representa la distribución porcentual de los registros según una clasificación agrupada de delitos violentos, no violentos y, cuando corresponda, otros o no clasificados.

Como clasificación inicial, pueden considerarse las siguientes categorías:

- **Violentos:** `ROBBERY`, `ASSAULT`, `BATTERY` y `HOMICIDE`.
- **No violentos:** `THEFT`, `BURGLARY` y `NARCOTICS`.
- **Otros o no clasificados:** categorías que no puedan asignarse de manera justificada a los grupos anteriores.

Esta clasificación es una propuesta analítica inicial y debe validarse antes de utilizarse en el dashboard.

**Fórmula:**

\[
\text{Proporción del grupo} (\%) =
\frac{\text{Registros pertenecientes al grupo}}
{\text{Total de registros clasificados}} \times 100
\]

**Utilidad:**

- Comprender la composición general de los delitos registrados.
- Comparar la participación de los grupos delictivos.
- Examinar cómo cambia esta composición entre períodos y zonas.
- Facilitar una interpretación agregada de los datos.

**Consideración metodológica:**

La clasificación debe ser coherente y documentada. No se deben asignar categorías automáticamente sin comprobar su significado.

Es recomendable incluir una categoría residual para evitar que los registros no clasificados desaparezcan del análisis. El denominador debe corresponder al conjunto de registros definido para el indicador.

# 3. KPIs temporales

Estos indicadores permiten analizar la evolución de los registros y comparar el volumen de delitos entre diferentes períodos.

## 3.1. Variación porcentual de los delitos registrados

**Descripción:**

Mide el cambio porcentual en el número de delitos registrados entre dos períodos comparables, como dos años consecutivos o dos meses equivalentes.

Por ejemplo, permite comparar los registros de 2025 con los de 2024 para identificar si el volumen aumentó o disminuyó.

**Fórmula:**

\[
\text{Variación} (\%) =
\frac{N*t-N*{t-1}}{N\_{t-1}} \times 100
\]

Donde:

- \(N_t\): número de registros del período actual.
- \(N\_{t-1}\): número de registros del período anterior.

**Interpretación:**

- Resultado positivo: aumento de los registros.
- Resultado negativo: disminución de los registros.
- Resultado igual a cero: el volumen de registros no cambió.

**Utilidad:**

- Comparar el volumen de registros entre períodos.
- Identificar cambios relevantes en las tendencias observadas.
- Analizar la evolución de categorías delictivas específicas.
- Complementar los gráficos de series temporales.

**Consideración metodológica:**

Este indicador no puede calcularse únicamente con una tabla de frecuencias agregadas por categoría. Se necesitan los registros desglosados por fecha.

Los períodos comparados deben tener una duración equivalente y una cobertura de datos comparable. Por ejemplo, no sería adecuado comparar un año completo con los registros parciales de otro sin ajustar el análisis.

Si el período anterior tiene cero registros, la variación porcentual no está definida mediante esta fórmula y debe tratarse como un caso especial.

Además, una variación en los registros no demuestra necesariamente un cambio equivalente en la criminalidad real.

## 3.2. Promedio diario de delitos registrados

**Descripción:**

Calcula el promedio de registros diarios durante un período determinado. Permite conocer el volumen medio de incidentes registrados por día.

**Fórmula:**

\[
\text{Promedio diario} =
\frac{\text{Total de registros del período}}
{\text{Número de días del período}}
\]

**Utilidad:**

- Comparar el volumen medio diario entre períodos.
- Analizar diferencias entre meses, años o zonas.
- Complementar el total de registros con una medida temporal normalizada.
- Identificar períodos con una mayor concentración de registros diarios.

**Consideración metodológica:**

El denominador debe representar los días del período analizado, no únicamente los días en los que hubo registros, salvo que se pretenda calcular específicamente un promedio condicionado a esos días.

Para comparar períodos con distinta duración, este indicador resulta más apropiado que comparar únicamente sus totales.

# 4. KPIs geográficos y de concentración espacial

Estos indicadores permiten explorar la distribución de los registros en Chicago e identificar diferencias entre distritos, zonas comunitarias y otras unidades geográficas disponibles.

## 4.1. Zona con mayor número de delitos registrados

**Descripción:**

Identifica la zona geográfica con mayor cantidad de registros durante el período seleccionado. La zona puede corresponder a un distrito (`District`), un sector policial (`Beat`) o un área comunitaria (`Community Area`), según el nivel de análisis elegido.

**Fórmula:**

\[
\text{Zona con mayor volumen} =
\underset{z \in Z}{\arg\max}
\left(N_z\right)
\]

Donde:

- \(Z\): conjunto de zonas geográficas.
- \(N_z\): número de registros asociados a la zona \(z\).

**Utilidad:**

- Identificar las zonas con mayor volumen de registros.
- Comparar la distribución geográfica de los delitos.
- Facilitar la exploración de posibles concentraciones espaciales.
- Orientar el análisis detallado de zonas específicas.

**Consideración metodológica:**

La zona con más registros no necesariamente es la zona con mayor incidencia relativa. Las diferencias pueden estar relacionadas con el tamaño de la población, la extensión territorial, la actividad comercial y otros factores.

Por tanto, este indicador mide volumen absoluto y no debe interpretarse automáticamente como una medida del riesgo individual de sufrir un delito.

## 4.2. Concentración de incidentes por distrito o zona (_Hotspot Analysis_)

**Descripción:**

Identifica las cinco zonas geográficas con mayor número de registros durante el período seleccionado.

Este indicador permite explorar concentraciones espaciales y reconocer dónde se acumula una mayor cantidad de incidentes registrados.

**Fórmula:**

Para cada zona \(z\):

\[
N*z = \sum*{i=1}^{n} I(z_i=z)
\]

Donde \(I\) vale 1 cuando el registro \(i\) pertenece a la zona \(z\) y 0 en caso contrario.

A partir de los valores calculados, se seleccionan las cinco zonas con mayor volumen.

**Utilidad:**

- Identificar las zonas con mayor concentración de registros.
- Comparar patrones geográficos entre períodos.
- Analizar las categorías delictivas predominantes en cada zona.
- Facilitar la exploración espacial mediante mapas y tablas.

**Consideración metodológica:**

Ordenar las zonas por número de registros permite identificar las de mayor volumen, pero no constituye por sí solo un análisis estadístico de puntos calientes (_hotspot analysis_).

Si se desea afirmar que una zona presenta una concentración espacial estadísticamente significativa, será necesario aplicar técnicas específicas de análisis espacial y documentar sus supuestos.

## 4.3. Tasa de delitos por cada 100.000 habitantes

**Descripción:**

Mide el número de registros de delitos en relación con la población de una zona geográfica. Permite comparar áreas con poblaciones de distinto tamaño.

**Fórmula:**

\[
\text{Tasa por 100.000 habitantes} =
\frac{\text{Número de registros del período}}
{\text{Población de la zona}} \times 100.000
\]

**Utilidad:**

- Comparar zonas con diferentes tamaños de población.
- Complementar los indicadores de volumen absoluto.
- Analizar diferencias relativas entre áreas geográficas.
- Examinar la evolución de la tasa cuando se dispone de datos poblacionales para varios períodos.

**Consideración metodológica:**

Este indicador requiere datos de población compatibles con la unidad geográfica y el período analizados.

La población utilizada debe corresponder a la misma zona y, cuando sea posible, al período de los registros. Si se utilizan datos de población de un año concreto para varios años de delitos, esta aproximación debe documentarse.

La tasa calculada representa registros por habitante y no necesariamente la probabilidad individual de sufrir un delito. También debe evitarse comparar directamente unidades geográficas de diferente naturaleza o escala sin considerar sus características.

# 5. KPIs relacionados con arrestos y uso de armas

Estos indicadores permiten analizar características registradas de los incidentes y comparar determinadas categorías delictivas.

## 5.1. Tasa de registros asociados a arrestos por tipo de delito

**Descripción:**

Calcula el porcentaje de registros de una categoría delictiva que presentan el indicador de arresto activado (`Arrest = True`).

Puede utilizarse para comparar categorías como `THEFT`, `ROBBERY` y `ASSAULT`.

**Fórmula:**

\[
\text{Tasa de arrestos} (\%) =
\frac{\text{Registros de la categoría con Arrest = True}}
{\text{Total de registros de la categoría}} \times 100
\]

**Utilidad:**

- Comparar la proporción de registros asociados a arrestos entre categorías.
- Identificar diferencias descriptivas entre tipos de delitos.
- Examinar cómo varía la proporción de arrestos según el período o la zona.
- Complementar el análisis de la composición delictiva.

**Consideración metodológica:**

Esta métrica no equivale a una tasa de resolución de casos ni demuestra por sí sola la efectividad policial.

Los resultados pueden estar relacionados con las características de los incidentes, las prácticas de registro y otros factores.

También es necesario verificar cómo se representan los valores desconocidos o nulos del campo `Arrest`. Si existen registros sin información, debe documentarse si se excluyen del denominador o se tratan de otra manera.

## 5.2. Proporción de robos y agresiones con armas

**Descripción:**

Mide qué porcentaje de los registros pertenecientes a las categorías seleccionadas de robo y agresión presenta evidencia registrada de uso de armas.

El cálculo depende de que los datos permitan identificar de forma suficientemente fiable los incidentes relacionados con armas.

**Fórmula:**

\[
\text{Proporción de incidentes con armas} (\%) =
\frac{\text{Registros de las categorías seleccionadas con armas}}
{\text{Total de registros de las categorías seleccionadas}} \times 100
\]

**Utilidad:**

- Analizar la presencia registrada de armas en determinadas categorías.
- Comparar la proporción de incidentes con armas entre períodos.
- Examinar diferencias geográficas.
- Complementar el análisis de las categorías de robo y agresión.

**Consideración metodológica:**

Antes de calcular este indicador, se debe verificar si el conjunto de datos contiene un campo específico o una clasificación fiable que permita identificar incidentes con armas.

No conviene inferir automáticamente el uso de armas buscando únicamente la palabra `ARMED` en el campo `description`, sin comprobar previamente los valores disponibles y el significado de cada descripción.

Si la fuente no permite determinarlo con suficiente fiabilidad, el indicador debe excluirse o presentarse con una advertencia explícita sobre la limitación.

# 6. KPIs predictivos

Los indicadores predictivos permiten estimar posibles comportamientos futuros a partir de los registros históricos. Sus resultados son estimaciones sujetas a incertidumbre y no deben presentarse como hechos confirmados.

## 6.1. Variación prevista de los delitos por categoría

**Descripción:**

Estima el cambio porcentual esperado en el volumen de registros de las principales categorías delictivas para un período futuro.

En lugar de predecir únicamente el total de delitos, CrimeBI puede estimar el volumen mensual futuro de categorías como `THEFT`, `BATTERY` y `MOTOR VEHICLE THEFT`.

Los resultados pueden clasificarse como aumento, disminución o estabilidad prevista, según criterios definidos previamente.

**Fórmula:**

\[
\text{Variación prevista} (\%) =
\frac{\widehat{N}\_{t+h}-N_t}{N_t} \times 100
\]

Donde:

- \(N_t\): volumen observado en el período de referencia.
- \(\widehat{N}\_{t+h}\): volumen estimado para el período futuro.
- \(h\): horizonte de predicción.

**Ejemplo ilustrativo:**

| Tipo de delito      | Variación prevista | Tendencia   |
| ------------------- | -----------------: | ----------- |
| THEFT               |               +5 % | Aumento     |
| BATTERY             |               -2 % | Disminución |
| MOTOR VEHICLE THEFT |               +8 % | Aumento     |

Los valores de la tabla son únicamente ilustrativos y no corresponden a predicciones calculadas con un modelo entrenado.

**Utilidad:**

- Identificar categorías cuyo volumen podría aumentar o disminuir.
- Comparar tendencias futuras entre tipos de delitos.
- Orientar la exploración de series temporales.
- Complementar el análisis descriptivo con estimaciones de comportamiento futuro.

**Consideración metodológica:**

Para implementarlo, es necesario construir series temporales por categoría y definir un horizonte de predicción.

Los modelos deben evaluarse con datos que no hayan intervenido en su entrenamiento, respetando el orden cronológico. Es recomendable comparar sus resultados con una referencia sencilla, como utilizar el último valor observado o el mismo período del año anterior.

Además, debe distinguirse entre una variación prevista y una variación estadísticamente significativa. Una diferencia pequeña puede deberse a la variabilidad de la serie y no representar un cambio relevante.

Cuando sea posible, se deben mostrar intervalos de predicción para comunicar la incertidumbre de las estimaciones.

# 7. Visualizaciones complementarias del dashboard

Las visualizaciones permiten explorar los datos con mayor detalle. No todas constituyen KPIs independientes, pero complementan los indicadores anteriores.

## 7.1. Distribución por tipo de delito

**Visualización propuesta:** gráfico de barras horizontales con los diez tipos de delitos más frecuentes.

**Información que proporciona:**

- Categorías delictivas con mayor volumen.
- Diferencias de frecuencia entre categorías.
- Participación relativa de las principales categorías.

**Interacción recomendada:**

Permitir filtrar por período y ubicación. Si se selecciona una categoría, las demás visualizaciones del dashboard deberían actualizarse cuando resulte pertinente.

## 7.2. Evolución temporal de los delitos

**Visualización propuesta:** gráfico de líneas con el número de registros por mes o año.

**Información que proporciona:**

- Evolución del volumen de registros.
- Períodos con aumentos o disminuciones.
- Posibles patrones estacionales.
- Diferencias entre categorías delictivas.

**Interacción recomendada:**

Incluir filtros por período, tipo de delito y ubicación. La granularidad temporal debe adaptarse al horizonte seleccionado para evitar gráficos excesivamente densos.

## 7.3. Distribución geográfica

**Visualización propuesta:** mapa de Chicago con la distribución de los registros por zona, distrito o coordenadas.

**Información que proporciona:**

- Distribución espacial de los incidentes.
- Zonas con mayor volumen de registros.
- Diferencias geográficas entre categorías delictivas.
- Posibles concentraciones espaciales.

**Interacción recomendada:**

Permitir seleccionar períodos y categorías. El mapa puede utilizar agregaciones por zona o coordenadas individuales, dependiendo de la calidad de los datos y del nivel de detalle requerido.

Cuando se utilicen coordenadas, deben verificarse los valores nulos, las ubicaciones inválidas y los registros que puedan quedar fuera del área geográfica esperada.

## 7.4. Distribución temporal por hora y día de la semana

**Visualización propuesta:** mapa de calor con los días de la semana en un eje y las horas del día en el otro.

**Información que proporciona:**

- Franjas horarias con mayor volumen de registros.
- Diferencias entre días laborables y fines de semana.
- Patrones temporales según la categoría delictiva.
- Períodos de mayor o menor concentración de registros.

**Interacción recomendada:**

Permitir filtrar por categoría, período y ubicación. Los valores del mapa de calor deben representar claramente el número de registros o la medida seleccionada.

**Consideración metodológica:**

Para comparar días y franjas horarias, conviene diferenciar el volumen absoluto de los promedios por intervalo. También se deben revisar los registros con fechas u horas inválidas.

# 8. Consideraciones generales de implementación

Para garantizar la consistencia de los indicadores de CrimeBI, deben definirse los siguientes criterios:

1. **Períodos comparables:** las comparaciones deben utilizar intervalos temporales equivalentes y considerar la cobertura de los datos.
2. **Clasificaciones documentadas:** las categorías agrupadas, como delitos violentos o delitos contra la propiedad, deben contar con reglas explícitas.
3. **Tratamiento de valores nulos:** se debe documentar cómo se gestionan los campos incompletos, especialmente `Arrest`, fecha, ubicación y categorías delictivas.
4. **Volumen frente a incidencia relativa:** el número absoluto de registros no equivale a una tasa poblacional ni mide por sí solo el riesgo individual.
5. **Interpretación de los arrestos:** la presencia de un arresto registrado no debe interpretarse automáticamente como resolución del caso o efectividad policial.
6. **Validación de predicciones:** los modelos predictivos deben evaluarse con datos temporales separados del entrenamiento y compararse con modelos de referencia.
7. **Actualización de los indicadores:** los KPIs deben recalcularse al actualizar los datos y respetar los filtros aplicados en el dashboard.
8. **Trazabilidad:** las reglas de transformación y agregación aplicadas durante el ETL deben documentarse para permitir la reproducción de los resultados.

# 9. Priorización de los KPIs

Para una primera versión del dashboard, se recomienda priorizar los indicadores que aportan una visión general clara y que pueden calcularse directamente con los datos disponibles.

| Prioridad | KPI                                                       | Requisito principal                             |
| --------- | --------------------------------------------------------- | ----------------------------------------------- |
| Alta      | Total de delitos registrados                              | Identificador o registros de la tabla de hechos |
| Alta      | Tipo de delito más frecuente                              | Categoría delictiva                             |
| Alta      | Variación porcentual de los delitos registrados           | Fecha y número de registros                     |
| Alta      | Zona con mayor número de delitos registrados              | Campo geográfico                                |
| Alta      | Concentración de incidentes por distrito o zona           | Campo geográfico                                |
| Alta      | Tasa de registros asociados a arrestos por tipo de delito | Categoría delictiva y campo `Arrest`            |
| Media     | Promedio diario de delitos registrados                    | Fecha y período definido                        |
| Media     | Proporción de delitos contra la propiedad                 | Clasificación documentada                       |
| Media     | Proporción de delitos violentos frente a no violentos     | Clasificación documentada                       |
| Media     | Tasa de delitos por cada 100.000 habitantes               | Datos poblacionales compatibles                 |
| Media     | Proporción de robos y agresiones con armas                | Identificación fiable de incidentes con armas   |
| Posterior | Variación prevista de los delitos por categoría           | Series temporales y modelos evaluados           |

La prioridad final debe considerar tanto el valor analítico de cada indicador como la disponibilidad, calidad y confiabilidad de los datos necesarios para calcularlo.
