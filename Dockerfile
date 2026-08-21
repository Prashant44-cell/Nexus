FROM node:20-alpine AS web-build
WORKDIR /src
COPY client-app/package*.json client-app/
COPY admin-app/package*.json admin-app/
RUN npm --prefix client-app ci && npm --prefix admin-app ci
COPY client-app client-app
COPY admin-app admin-app
RUN npm --prefix client-app run build -- --base / && npm --prefix admin-app run build -- --base /admin/

FROM python:3.12-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend .
COPY --from=web-build /src/client-app/dist /app/web/client
COPY --from=web-build /src/admin-app/dist /app/web/admin
CMD ["python", "run.py"]
