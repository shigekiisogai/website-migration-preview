---
title: "Stable Matching and the Deferred Acceptance Algorithm"
field: "CASE 01 · Market design"
stage: idea
levels: [1, 2, 3]
sources: [Gale–Shapley 1962, Roth–Peranson 1999, Abdulkadiroğlu–Sönmez 2003]
verification_status: AI-drafted, sources not yet verified
updated: 2026-10-30
translation_status: draft
source_updated: 2026-10-30
source_sha256: 8e79ee1ee0d4185140d91154c870baee04dbd67fa487ead366b1e3fe34fcad55
---

# Stable Matching and the Deferred Acceptance Algorithm

## Question

**Question: When students and institutions want the same partners, how should we match them?**

## Overview

::: {.level-content data-level="1"}
Start by applying to your preferred partner. Each recipient tentatively holds its favorite proposal among those received. Anyone rejected moves on to their next choice. Repeating these steps is the core of deferred acceptance (DA).
:::

::: {.level-content data-level="2"}
DA finds a stable matching through repeated proposals and tentative acceptance. This page considers three students and three hospitals, with one position per hospital, strict preferences, and every potential partner acceptable to everyone.
:::

::: {.level-content data-level="3"}
Designing a matching system begins with preferences, capacities, priorities, and participation rules. We first examine the properties of basic DA, then consider the additional constraints in actual institutions. This prototype uses computational experiments; estimating the effects of a matching system is a topic for future work.
:::

## Applications: medical residency matching and school choice

Matching medical residents to hospitals and assigning students to schools are prominent applications of market design. We plan to read Gale–Shapley (1962) for the foundations of stable matching, Roth–Peranson (1999) for the design of the physician matching market, and Abdulkadiroğlu–Sönmez (2003) for school choice. **Applications and references: AI-drafted, sources not yet verified.**

## Scope and limitations

In school choice, schools' rankings represent institutional priorities. Actual residency systems have additional features, including multiple positions and couples. The experiment below is a one-to-one teaching model of the core DA procedure. Details of current systems will be checked against official materials before publication.

## Model

::: {.level-content data-level="1"}
If a student and a hospital each prefer one another to their current partners, they would both like to form a new pair. They constitute a blocking pair. Look for the red dashed lines in the demo.

A stable matching has no blocking pairs. Switching the proposing side lets us compare whose interests are favored among the stable matchings.
:::

::: {.level-content data-level="2"}
Let μ denote a matching. A student s and hospital h form a blocking pair (s, h) if each prefers the other to their current partner. Being unmatched ranks below every partner.

- Each student and each hospital has at most one partner.
- A matching is stable if every matched partner is acceptable and there are no blocking pairs.
- Each proposer proposes to a given recipient at most once, so this example terminates after at most nine proposals.
- In the standard one-to-one model with strict preferences, student-proposing DA yields the student-optimal stable matching; hospital-proposing DA yields the hospital-optimal stable matching.

Here, “optimal” refers to the set of stable matchings under the same preferences. Maximizing a numerical sum of satisfaction is a separate criterion.
:::

::: {.level-content data-level="3"}
The first tasks are to establish termination and stability under strict, complete preferences. A recipient's tentative partner improves as the procedure progresses. A proposer rejected by a recipient they prefer to their eventual partner cannot form a blocking pair with that recipient at the end. Use this observation to construct a proof.

Next, we will check the model and theorem assumptions for proposer optimality and strategy-proofness on the proposing side against the original sources. School priorities, capacities, ties, and couples require further examination of both the conditions and the algorithm.
:::

## Data and estimation

All rankings are fictional teaching data. Student numbers 1–3 identify hypothetical agents. Enter each of 1, 2, and 3 exactly once in each row. Hold preferences fixed when comparing the proposing sides. The stability check examines all nine student–hospital pairs.

::: {.level-content data-level="3"}
Possible data for future empirical work include submitted rankings, capacities, assignments, and dates of institutional changes. We will consider when submitted rankings can be interpreted as true preferences, how participants select into the system, and what can be observed. This site contains no real individuals' rankings or assignment records. The starting point is reproducible comparisons using public descriptions of institutions and fictional data.
:::

## Demo

<div id="demo-da" class="demo"><p>Enable JavaScript to edit preferences and run the DA procedure.</p></div>

**Try it:** Run student-proposing DA to completion with the initial preferences, then compare it with hospital-proposing DA. Change student 1's ranking and explain how the assignment and number of proposals change. Use “An unstable matching” to identify who would like to form a new pair.

## Learning path

Preferences and choice in introductory microeconomics → strategies and institutions in game theory → stability and incentives in market design → algorithm verification through programming. These are examples of subject areas; actual course offerings and prerequisites require separate confirmation.

## Career connections

Designing assignment and staffing systems, analyzing education policy, and allocating participants on platforms. Practical applications also require attention to fairness, operating costs, legal institutions, and participants' acceptance of the system.

## Seminar activity record

Complete this section after an activity takes place. The record is currently blank.

| Date | Activity | Student outcomes / shareable work | Next question |
| --- | --- | --- | --- |
|  |  |  |  |

## References and sources

All entries below are **AI-drafted, sources not yet verified**. Authors, years, titles, and the relevant passages will be checked before publication.

- Gale, D. and Shapley, L. S. (1962), “College Admissions and the Stability of Marriage.”
- Roth, A. E. and Peranson, E. (1999), “The Redesign of the Matching Market for American Physicians: Some Engineering Aspects of Economic Design.”
- Abdulkadiroğlu, A. and Sönmez, T. (2003), “School Choice: A Mechanism Design Approach.”

[Market design ideas](../fields/market-design.md) · [Home](../index.md)
