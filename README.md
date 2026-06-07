# AI Concierge Omni-Engine (MVP)

The **AI Concierge Omni-Engine** is a multimodal search solution that transcends keyword-based indexing. It leverages Gemini's vision, semantic understanding, and context-aware reasoning to map user needs—ranging from explicit product searches to emotional states or lifestyle goals—directly to a curated catalog.

The logic is encapsulated in a single, high-performance React component, designed for seamless drop-in integration.

## Core Value Proposition
- **Multimodal Intelligence:** Processes text, voice, and visual inputs simultaneously to understand intent beyond surface-level queries.
- **Contextual Reasoning:** Instead of matching strings, it understands the "vibe" and "problem" the user is trying to solve (e.g., "My back hurts" maps to ergonomic solutions).
- **Zero-Index Dependency:** Operates as an autonomous "Black Box" engine, requiring no external indexing infrastructure.

## Technical Architecture
- **Engine:** Gemini 2.5 Flash (Multimodal)
- **Framework:** React + TypeScript
- **Integration:** The system is designed as an autonomous, modular logic unit that can be integrated into any existing e-commerce storefront with minimal footprint.

## Integration Guidelines
The engine is delivered as an encapsulated logic unit. To integrate:
1. **API Handshake:** Configure the Gemini endpoint within your environment.
2. **Context Injection:** The system expects a JSON catalog; the engine handles all mapping and reasoning logic internally.
3. **Black Box Compliance:** The engine is self-contained. No external middleware is required for intent mapping.

## License & Usage
**© 2026 [Giga Imerlishvili / AI Concierge bar]**
This project is proprietary software. All rights reserved. Unauthorized reproduction, modification, or integration into commercial products without explicit licensing is strictly prohibited.

## Commercial Usage & Licensing
This project is released under the GNU AGPLv3 license. This ensures that the software remains open-source and that any derivative works or integrated services also contribute back to the community.

## Looking for a Proprietary License?
While the AGPLv3 license is perfect for open-source contributions, I understand that enterprise environments often require greater flexibility. If you are interested in integrating this technology into a closed-source product, a SaaS platform, or an internal enterprise system without the copyleft obligations of the AGPLv3, I offer commercial licensing options.

Why choose a commercial license?

Freedom: Use the code in proprietary/closed-source applications.

Support: Priority architecture guidance and integration support.

Compliance: Avoid the complexities of the AGPLv3 requirements for your internal systems.

For licensing inquiries, technical architecture consultations, or partnership opportunities, please contact me directly at: gigaimerlishvili98@gmail.com




