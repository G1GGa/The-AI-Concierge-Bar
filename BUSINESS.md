# Financial Sustainability and Profit Model

This document outlines the unit economics and pricing strategy designed to ensure the operational profit and long-term viability of **The AI Concierge Bar**.

## 1. Monetization Strategy (B2B SaaS)
We utilize a tiered monthly subscription layer tailored for e-commerce storefronts:
* **Starter Tier ($19/mo):** For micro-merchants. Includes up to 1,000 semantic product matching queries per month.
* **Growth Tier ($49/mo):** Unlocks full multimodal capabilities (desktop photo uploads and simulated voice intent reasoning via Gemini 2.5 Flash).
* **Enterprise Tier (Usage-Based):** Custom volume pricing targeting $0.03 per successful interactive search consultation.

## 2. Unit Economics & High Profit Margins
Our operational expense (OpEx) is exceptionally low because the architecture runs directly on the client-side, making server hosting overhead minimal. 

The primary cost driver is the Google Gemini API:
* **Gemini 2.5 Flash Input Cost:** $0.000075 / 1K tokens
* **Gemini 2.5 Flash Output Cost:** $0.0003 / 1K tokens

An average user consultation session consumes roughly 2,000 tokens (input + output combined), resulting in an infrastructure cost of approximately **$0.00045 per search**. 

* At $0.03 per search charge in our volume tier, our gross profit margin per query is **98.5%**. 
* This massive delta between API cost and SaaS pricing guarantees that business operations remain profitable, self-sustaining, and highly scalable from day one.
