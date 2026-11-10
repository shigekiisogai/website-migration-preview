---
title: "Demand Prediction and Estimation with Discrete Choice Models"
field: "CASE 02 · Discrete choice and marketing"
levels: [1, 2, 3]
sources: [McFadden 1974, Berry 1994]
updated: 2026-10-30
source_updated: 2026-10-30
---

# Demand Prediction and Estimation with Discrete Choice Models

## Question

**Question: How does a price increase affect sales and profit?**

## Overview

::: {.level-content data-level="1"}
Consumers choose between drink A, drink B, and buying neither. Raising A's price reduces the share choosing A but increases the margin on each unit sold. Use the sliders to compare these two effects.
:::

::: {.level-content data-level="2"}
We express utility in terms of price and quality, then calculate choice probabilities using a multinomial logit model. In a hypothetical market where 1,000 people each choose once and share the same coefficients on attributes, these probabilities are predicted market shares.
:::

::: {.level-content data-level="3"}
Estimate coefficients from individual choices and use them to predict demand after a price change. We distinguish maximum likelihood estimation with individual data from demand estimation using aggregate shares, paying attention to the unit of observation and identification assumptions.
:::

## Applications: analyzing product choice

Transport mode choice and product choice are applications of discrete choice models. We introduce McFadden (1974) as a starting point for conditional logit and Berry (1994) as an introduction to demand analysis using market shares of differentiated products.

## Scope and limitations

This is a fictional drinks market with no numerical data from actual products, firms, or consumers. Using estimated coefficients or sales forecasts for business decisions requires data from the relevant market and validation of the assumptions.

## Model

::: {.level-content data-level="1"}
In this model, lower prices and higher quality make a product more likely to be chosen. The option to buy neither means that, when both products become more expensive, more people forgo purchasing.

If each of 1,000 people chooses A with probability 30%, predicted sales of A are 300 units. Profit is the price–unit cost margin multiplied by sales. This experiment abstracts from the additional costs of improving quality.
:::

::: {.level-content data-level="2"}
Price p is measured in yen; quality q is a teaching index from 0 to 5. The observable utility of product j is

$$V_j = -1.2\frac{p_j}{100}+0.9q_j,\qquad V_0=0.$$

Option 0 denotes buying neither. Assume that the errors in individual utility Uᵢⱼ = Vⱼ + εᵢⱼ are independent and identically distributed standard type-I extreme value variables. Then

$$P_j=\frac{\exp(V_j)}{1+\exp(V_A)+\exp(V_B)},\qquad P_0=\frac{1}{1+\exp(V_A)+\exp(V_B)}.$$

With market size M = 1,000, unit cost c = 80 yen, and zero fixed costs,

$$Q_j=MP_j,\qquad \pi_j=(p_j-c)MP_j.$$

These coefficient values are assumed. The price coefficient −1.2 measures the change in utility per 100 yen. Own-price elasticity is −1.2(pⱼ/100)(1−Pⱼ), so it also depends on price and market share.
:::

::: {.level-content data-level="3"}
After normalizing utility levels and the scale of the errors, coefficients are identified from utility differences across alternatives. In conditional logit with common coefficients, a term shared by every alternative in a choice set cancels out. The attribute vector for buying neither is (0, 0) in this demo.

Independence of irrelevant alternatives (IIA) in standard logit requires that the ratio of the choice probabilities of two alternatives be independent of the attributes of other alternatives. Extensions such as nested logit and mixed logit can capture substitution toward similar products and differences in preferences across people.

Observed prices may be correlated with unobserved quality or demand shocks. To discuss the causal effect of price changes, consider price endogeneity and identification strategies such as instrumental variables. Here we use fictional data with exogenously generated prices and quality.
:::

## Data and estimation

Slider values, market size, and costs are teaching assumptions. Shares use all 1,000 potential consumers, including those who buy neither, as the denominator. The three unrounded probabilities sum to one. Moving a slider recalculates predictions under the same coefficients.

::: {.level-content data-level="3"}
In the estimation experiment, 1,800 people each choose once between A, B, and buying neither. Prices of A and B in units of 100 yen are independently drawn uniformly from 1 to 5, and quality from 0 to 5. Choices are drawn from logit probabilities with true coefficients (−1.2, 0.9). The generation procedure and seed are fixed in the code.

Using yᵢⱼ to indicate the chosen alternative, we maximize the log-likelihood:

$$\ell(\beta)=\sum_i\sum_j y_{ij}\log P_{ij}(\beta).$$

JavaScript computes the score and information matrix and applies Newton updates with step-size adjustment. The display reports whether the largest absolute component of the average score is below 10⁻⁸. Numerical validation covers this teaching design; a general-purpose estimator for user-supplied data is a possible future extension.

The simple logit relationship connected to Berry (1994) is log(sⱼ) − log(s₀) = δⱼ. Defining the outside option share s₀ from market size and addressing price endogeneity are central considerations. The estimator on this page is maximum likelihood for individual choice data.
:::

## Demo

<div id="demo-logit" class="demo"><p>Enable JavaScript to use the price and quality sliders.</p></div>

::: {.level-content data-level="3"}
<div id="demo-mle" class="demo"><p>Enable JavaScript to run maximum likelihood estimation on fictional data.</p></div>
:::

**Try it:** Increase only A's price and explain how sales and profit change. Then vary B's price and examine whether the price that gives A a high profit changes. Quality comparisons hold unit cost fixed at 80 yen.

## Learning path

Utility, demand, and firm behavior in introductory microeconomics → probability and estimation in statistics → identification and maximum likelihood in econometrics → demand estimation and price competition in industrial organization. These are examples of subject areas.

## Career connections

Demand forecasting in marketing, product design, pricing analysis, transport policy forecasts, and competition policy. These applications develop the ability to compare model predictions with observations and explain assumptions and uncertainty.

## Seminar activity record

Complete this section after an activity takes place. The record is currently blank.

| Date | Activity | Student outcomes / shareable work | Next question |
| --- | --- | --- |
|  |  |  |  |

## References and sources



- McFadden, D. (1974), “Conditional Logit Analysis of Qualitative Choice Behavior.”
- Berry, S. T. (1994), “Estimating Discrete-Choice Models of Product Differentiation.”

[Discrete choice ideas](../fields/discrete-choice.md) · [Empirical microeconomics ideas](../fields/empirical-micro.md) · [Home](../index.md)
