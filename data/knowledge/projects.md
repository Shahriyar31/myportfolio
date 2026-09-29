---
title: Other projects
tags: projects, portfolio, built, github, poultry shield, stockflow, radiation tracker, book analysis, machine learning, data engineering, nlp
---
## Poultry Shield
Deep learning for early diagnosis of coccidiosis in poultry from images. I fine-tuned a VGG16 CNN (ImageNet pre-trained), built a 4-stage DVC pipeline (ingestion → base model → training → evaluation) and a Flask REST API with a small web page for live predictions. It reached 97.51% validation accuracy with a validation loss of 0.058. Tools: TensorFlow, VGG16, DVC, Flask, Python.

## StockFlow
An end-to-end streaming pipeline for stock market data without a traditional warehouse. Apache Kafka 3.8 on EC2 publishes OHLCV stock records every second; consumers land the data in an S3 data lake, Glue crawlers catalogue the schema, and Athena runs serverless SQL on it, with Jupyter for exploration.

## Radiation Tracker
A TUHH Big Data team project (team of four) for real-time monitoring and a live map of radiation levels: Kafka producers stream sensor data, Flink processes it and a WebSocket-fed web map shows it, deployed with Docker on a Google Cloud VM. I was the project coordinator, improved the frontend (UI/UX, layout, bug fixes and components) and added the WebSocket integration for real-time map updates.

## Book Analysis
Text analysis of the book "Miracle in the Andes" with Python and NLTK: chapter counting with string methods and regular expressions, the most used words with stopwords filtered out, and VADER sentiment for the whole book and each chapter to find the most positive and negative ones.
