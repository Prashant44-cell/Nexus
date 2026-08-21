FROM node:20-alpine AS web-build
WORKDIR /src
COPY frontend/package*.json frontend/
RUN npm --prefix frontend ci
COPY frontend frontend
RUN npm --prefix frontend run build:client && npm --prefix frontend run build:admin

FROM python:3.12-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend .
COPY --from=web-build /src/frontend/dist/client /app/web/client
COPY --from=web-build /src/frontend/dist/admin /app/web/admin
CMD ["python", "run.py"]
