---
title: Research at TUHH
tags: research, tuhh, digital twin, granulation, paper, preprint, publication, mcp, owasp, eu ai act, thesis, academic
---
## Digital Twin Frontend (TUHH research project)
As a TUHH research project (12 ECTS) I built the frontend of a digital twin for granulation process monitoring: a containerised, real-time monitoring dashboard for an industrial digital twin of a fluidised-bed granulation process. I wrote vectorised Pandas preprocessing with automatic delimiter detection and BOM stripping that feeds InfluxDB, orchestrated the microservices stack with Kafka, Flink and Docker Compose, and cut the frontend image from about 900 MB to 150 MB with multi-stage builds and layer caching. The dashboard uses Plotly Dash. Code: github.com/rkraeuter/DigitalTwinGF3.

## My preprint
My preprint "Mapping OWASP LLM Top 10 to EU AI Act Requirements: A Security Governance Framework for Enterprise RAG Systems" was published in April 2026 as a Hamburg University of Technology (TUHH) preprint. It connects the OWASP Top 10 risks for LLM applications with what the EU AI Act requires, as a governance framework for enterprise RAG systems.

## Current research interest
I'm researching security threats in the Model Context Protocol (MCP): how AI agents that call tools through MCP can be attacked, and how to control that access safely.
