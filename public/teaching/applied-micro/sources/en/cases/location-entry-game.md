---
title: "Location Choice and Entry Games"
field: "CASE 03 · Location choice and entry games"
levels: [1, 2, 3]
sources: [Bresnahan–Reiss 1991, Seim 2006]
updated: 2026-10-30
source_updated: 2026-10-30
---

# Location Choice and Entry Games

## Question

**Question: Where should a firm open a store when population and a competitor's location change?**

## Overview

::: {.level-content data-level="1"}
A store attracts nearby residents. If a rival opens nearby, the stores share customers. In a town with few residents or high entry costs, staying out may be an option. Place two firms in a fictional town and see whether either would like to change its choice.
:::

::: {.level-content data-level="2"}
This is an entry and location game in which two firms simultaneously choose among staying out, West, Center, and East. Each firm operates at most one store. We ask whether it can improve its payoff by changing its own choice while holding its rival's choice fixed.
:::

::: {.level-content data-level="3"}
Jointly modeling entry and location takes us from store counts to the distances between competitors and the distribution of demand. This demo is a static game of complete information. Connections to empirical models with private information, multiple equilibria, and unobserved costs will be considered after checking the literature.
:::

## Applications: store counts and local demand

Entry in retail and services depends on local population, travel distances, competition, and fixed costs. We introduce Bresnahan–Reiss (1991) for the relationship between market size, entry, and competition, and Seim (2006) for entry and location or product-type choice.

## Scope and limitations

Convenience stores provide a familiar setting for exploring these ideas. All diagrams and numbers below are fictional. The relationship between this teaching example and the empirical settings and findings of the two papers will be clarified when the original sources are checked.

## Model

::: {.level-content data-level="1"}
The green circle represents firm A; the orange square represents firm B. Residents choose the nearer store and split equally when distances are tied. If all stores are too far away, they buy from neither store in this town.

A ★ in the payoff table marks a pair of choices where neither firm can gain by changing its own choice while its rival stays put. This is a Nash equilibrium. Multiple stars mean the model permits multiple outcomes.
:::

::: {.level-content data-level="2"}
Each firm's strategies are Stay out, West, Center, and East. Each resident demands one unit from the nearest store, provided it is within two grid steps. Distance is the sum of horizontal and vertical steps. Tied demand is shared equally. Both firms may choose the same location.

Let store sales be Dᵢ, own and rival choices be aᵢ and a₋ᵢ, and fixed cost be F. With a unit margin of one teaching unit, the payoff from entry is Dᵢ(aᵢ, a₋ᵢ) − F; staying out yields zero.

At a Nash equilibrium, the following holds for every alternative choice aᵢ′:

$$\pi_i(a_i,a_{-i})\geq\pi_i(a_i',a_{-i}).$$

We search for pure-strategy equilibria. All 16 choice pairs are compared, and ties in payoffs are included among optimal choices.
:::

::: {.level-content data-level="3"}
We first enumerate a complete-information payoff table, then consider the problem of estimating unknown payoff parameters from observed store locations. Empirical work must address correlations between population and unobserved demand, cost factors such as land prices, competitors' presence, and the set of candidate locations.

With multiple equilibria, an observed outcome raises the question of which equilibrium generated it. Possible approaches include equilibrium selection assumptions, incomplete-information models, and partial identification. This demo enumerates pure-strategy equilibria from known payoffs; it performs no estimation.
:::

## Data and estimation

The town is a 5×5 grid. Coordinates x and y run from 0 to 4. Baseline population in each cell is 8 + 6 × (4 − |x−2| − |y−2|), totaling 440 residents. A common population multiplier applies to every cell. Displayed populations are rounded; calculations use unrounded values. Firms, residents, population, and costs are all fictional.

Candidate locations are West (0, 2), Center (2, 2), and East (4, 2). The model abstracts from prices, product differences, road constraints, coordination among a firm's multiple stores, and exit over time.

::: {.level-content data-level="3"}
Future plans include using **e-Stat regional mesh statistics** and **National Land Numerical Information** as possible sources for GIS displays of population, transport, and land use. These data have not been acquired or used here. Before use, we will check each dataset's provider, year, grid resolution, coordinate reference system, terms and license, attribution requirements, and redistribution permissions. Sources and terms for store locations will be selected separately.

Analyzing population and store counts also requires considering market boundaries, travel to neighboring markets, and endogenous population changes. Interpreting a simple correlation as an estimate of a competition effect requires additional assumptions and data.
:::

## Demo

<div id="demo-location" class="demo"><p>Enable JavaScript to change store locations, population, and costs.</p></div>

**Try it:** Move the population multiplier from 0.5 to 3 and observe the equilibrium number of stores. Then vary fixed costs and compare the population ranges that support the first and second stores.

::: {.level-content data-level="1"}
A larger population creates more sales opportunities and can change how many stores cover their costs. A second store shares demand with the existing store, so competition affects the relationship between the populations needed to support one and two stores. This provides an entry point to Bresnahan–Reiss.
:::

::: {.level-content data-level="2"}
The relationship between population and store counts depends on demand allocation, catchment areas, and costs. Because travel distance is limited here, a new store can also reach residents who previously bought from neither store. When interpreting population thresholds, distinguish demand expansion from the division of demand through competition.
:::

::: {.level-content data-level="3"}
When reading Bresnahan–Reiss, we will connect entry thresholds and the market size required per firm to the original assumptions about demand, costs, and markets. This demo's population–equilibrium graph is not a replication of that paper's estimated model or empirical findings. When reading Seim, we plan to examine the roles of location differences and private information.
:::

## Learning path

Firm behavior in introductory microeconomics → Nash equilibrium in game theory → entry and competition in industrial organization → spatial data analysis in econometrics and GIS. These are examples of subject areas.

## Career connections

Catchment-area analysis for store development, local service provision, urban policy, and competition policy. Combining population maps with models of competition helps explain candidate locations and the conditions relevant to a decision.

## Seminar activity record

Complete this section after an activity takes place. The record is currently blank.

| Date | Activity | Student outcomes / shareable work | Next question |
| --- | --- | --- |
|  |  |  |  |

## References and sources



- Bresnahan, T. F. and Reiss, P. C. (1991), “Entry and Competition in Concentrated Markets.”
- Seim, K. (2006), “An Empirical Model of Firm Entry with Endogenous Product-Type Choices.”
- Possible future data: e-Stat regional mesh statistics and National Land Numerical Information. Specific datasets, years, and terms of use remain to be determined.

[Location choice ideas](../fields/location.md) · [Home](../index.md)
