# Makefile — chicago-crime-bi
# Uso: make help

SHELL := /bin/bash
.DEFAULT_GOAL := help

# Carga el .env de la raíz (AWS_PROFILE, AWS_REGION, REDSHIFT_*...)
-include .env
export

AWS_PROFILE ?= default
AWS_REGION  ?= us-east-1
export AWS_PROFILE AWS_REGION

CDK      := cd infra && npx cdk
DATA_STACK := ChicagoCrimeDataStack

.PHONY: help
help: ## Muestra esta ayuda
	@grep -E '^[a-zA-Z0-9_-]+:.*?## ' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ---------------------------------------------------------------- Entorno
.PHONY: setup aws-check
setup: ## Instala dependencias de Python, infra y frontend
	uv sync --all-groups
	cd infra && npm install
	cd frontend && npm install

aws-check: ## Verifica el perfil de AWS
	aws sts get-caller-identity --profile $(AWS_PROFILE)

# -------------------------------------------------------------------- ETL
.PHONY: extract clean transform population validate etl-local load-s3 load-redshift etl-load etl
extract: ## Descarga los datos desde la API de Socrata
	uv run python -m etl.extract

clean: ## Limpieza de los datos crudos
	uv run python -m etl.clean

transform: ## Construye dimensiones y tabla de hechos
	uv run python -m etl.transform

population: ## Genera el parquet de población (requiere data/geo/community_population.csv)
	uv run python -m etl.population

validate: ## Valida el modelo estrella local
	uv run python -m etl.validate

etl-local: clean transform population validate ## Pipeline local sin AWS (usa el raw ya descargado)

load-s3: ## Sube los parquet a S3
	uv run python -m etl.load_s3

load-redshift: ## DDL + COPY + validación en Redshift (recarga completa)
	uv run python -m etl.load_redshift

etl-load: load-s3 load-redshift ## Carga a AWS (S3 y Redshift)

etl: extract etl-local etl-load ## Pipeline completo: descarga, limpieza, validación y carga

# ----------------------------------------------------------- Infraestructura
.PHONY: infra-bootstrap infra-synth infra-diff deploy-data destroy-data infra-outputs redshift-check
infra-bootstrap: ## cdk bootstrap (una vez por cuenta y región)
	$(CDK) bootstrap

infra-synth: ## Genera el CloudFormation (detecta errores de código)
	$(CDK) synth --quiet

infra-diff: ## Muestra los cambios pendientes
	$(CDK) diff

deploy-data: ## Despliega S3 + Redshift Serverless
	$(CDK) deploy $(DATA_STACK)

destroy-data: ## BORRA S3 y Redshift (pide confirmación)
	$(CDK) destroy $(DATA_STACK)

infra-outputs: ## Muestra las salidas del stack de datos (para copiarlas al .env)
	aws cloudformation describe-stacks --stack-name $(DATA_STACK) \
		--query "Stacks[0].Outputs[].[OutputKey,OutputValue]" --output table

redshift-check: ## Prueba de conectividad: SELECT 1 vía Data API
	@ID=$$(aws redshift-data execute-statement --workgroup-name $(REDSHIFT_WORKGROUP) \
		--database $(REDSHIFT_DATABASE) --sql "select 1" --query Id --output text); \
	sleep 3; aws redshift-data describe-statement --id $$ID --query Status --output text

# --------------------------------------------------------------- Desarrollo
.PHONY: api-descriptive api-predict web web-build typecheck test lint
api-descriptive: ## API descriptiva en local (http://localhost:8000/docs)
	uv run uvicorn backend.app.descriptive_main:app --reload

api-predict: ## API predictiva en local (puerto 8001)
	uv run uvicorn backend.app.predictive_main:app --reload --port 8001

web: ## Frontend en local (http://localhost:5173)
	cd frontend && npm run dev

web-build: ## Compila el frontend (tsc + vite build)
	cd frontend && npm run build

typecheck: ## Revisa tipos del frontend
	cd frontend && npx tsc -b --noEmit

test: ## Pruebas de Python
	uv run pytest

lint: ## Linter de Python
	uv run ruff check .

# ------------------------------------------------------------------ Despliegue
BACKEND_STACK  := ChicagoCrimeBackendStack
FRONTEND_STACK := ChicagoCrimeFrontendStack

.PHONY: check-artifacts deploy-backend deploy-frontend-infra deploy-frontend \
        deploy-all destroy-all site-url api-url

check-artifacts: ## Verifica que existan los JSON del modelo (los usa la imagen predictiva)
	@test -f ml/artifacts/forecast_types.json && test -f ml/artifacts/metrics_types.json \
		|| (echo "Faltan artefactos: ejecuta 'make train'" && exit 1)

deploy-backend: check-artifacts ## Construye imágenes de las Lambdas y despliega la API
	$(CDK) deploy $(BACKEND_STACK)

deploy-frontend-infra: ## Crea S3 + CloudFront (una vez, o si cambia el stack)
	$(CDK) deploy $(FRONTEND_STACK)

deploy-frontend: web-build ## Compila, sube a S3 e invalida CloudFront
	@BUCKET=$$(aws cloudformation describe-stacks --stack-name $(FRONTEND_STACK) \
		--query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" --output text); \
	DIST=$$(aws cloudformation describe-stacks --stack-name $(FRONTEND_STACK) \
		--query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" --output text); \
	aws s3 sync frontend/dist s3://$$BUCKET --delete; \
	aws cloudfront create-invalidation --distribution-id $$DIST --paths "/*"

deploy-all: check-artifacts ## Despliega todos los stacks (datos, backend, frontend infra)
	$(CDK) deploy --all

destroy-all: ## BORRA toda la infraestructura (pide confirmación)
	$(CDK) destroy --all

site-url: ## URL pública del dashboard
	@aws cloudformation describe-stacks --stack-name $(FRONTEND_STACK) \
		--query "Stacks[0].Outputs[?OutputKey=='SiteUrl'].OutputValue" --output text

api-url: ## URL directa de la API (para depurar)
	@aws cloudformation describe-stacks --stack-name $(BACKEND_STACK) \
		--query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" --output text

# --------------------------------------------------------------- ML
.PHONY: train

train: ## Entrena el modelo de predicción
	uv run python -m ml.train_types