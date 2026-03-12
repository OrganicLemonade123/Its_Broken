# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"It's Broken" is a DIYer companion app. Core features:
- **User inventory** — track tools and materials the user already owns
- **Task management** — define the current repair/build project
- **Tool & material suggestions** — AI-driven recommendations for what's needed, where to buy it, and estimated costs
- **Step-by-step tutorials** — guided instructions tailored to the task and skill level
- **Contractor escalation** — option to find/contact a contractor when the job is too complex

## Stack (to be decided)

No code exists yet. When the stack is chosen, update this file with:
- Build, lint, and test commands
- How to run a dev server and a single test
- Key architectural decisions (state management, API layer, AI integration)

## AI Integration

The assistant features will use the Claude API (claude-sonnet-4-6 or claude-opus-4-6) for:
- Diagnosing the problem from user description
- Recommending tools/materials with purchase links
- Generating step-by-step repair tutorials
- Deciding when to suggest a contractor
