---
title: Argus AI (my own project)
tags: argus, project, compliance, eu ai act, gdpr, platform, langgraph, rag, side project, product, live
---
## What Argus AI is
Argus AI is my own open platform that automates EU AI Act, GDPR and NIST AI RMF compliance end to end. You describe an AI system and get a full compliance report in seconds, with a tamper-evident audit record. It is live and currently in free beta at eu-ai-act-governance-platform.vercel.app, and the code is on GitHub at github.com/Shahriyar31/eu-ai-act-governance-platform.

## How Argus AI works
A LangGraph agent runs classify → route → DPIA → OWASP → summary, and pauses for a human on high- and limited-risk systems. A rule engine plus an LLM risk classifier uses 41 live risk rules stored in PostgreSQL. It generates GDPR Article 35 DPIAs and runs OWASP LLM Top 10, NVD and MITRE ATLAS checks. A RAG assistant over 665+ EU AI Act chunks in pgvector answers with citations and is evaluated with RAGAS. Every decision goes into a SHA-256 hash-chained audit trail.

## Argus AI tech and delivery
FastAPI and React, Groq Llama 3.3 with fallbacks via Cloudflare AI Gateway, deployed on Azure Container Apps with Terraform. DevSecOps gates (SAST, SCA and Trivy) in GitHub Actions block builds on critical findings, across 114+ CI builds. Monitoring uses Prometheus, Grafana and Sentry.
