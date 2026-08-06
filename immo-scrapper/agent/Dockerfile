# Agent de scrapping Licitor : Python léger, tourne en continu
# (un passage au démarrage puis un passage chaque nuit à minuit).
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY scraper.py .
ENV PYTHONUNBUFFERED=1
CMD ["python", "scraper.py"]
