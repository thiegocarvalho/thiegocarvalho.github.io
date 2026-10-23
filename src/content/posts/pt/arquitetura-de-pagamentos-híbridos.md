---
title: Arquitetura de pagamentos híbridos
description: Como combinar trilhos tradicionais e liquidação on-chain sem duplicar a lógica de negócio nem perder a conciliação.
pubDate: 2026-10-23
lang: pt
---

Um sistema de pagamentos híbrido é aquele que move valor por mais de um tipo de trilho: Pix, TED e cartão de um lado, liquidação on-chain do outro. O erro mais comum é tratar cada trilho como um produto separado, com sua própria lógica de negócio. Em pouco tempo, as regras de limite, de antifraude e de conciliação existem em duas versões que divergem.

## Um ledger, vários trilhos

A decisão que mais pesa é manter **um único ledger interno** como fonte da verdade. Cada trilho vira um adaptador que traduz eventos externos (um Pix confirmado, uma transação com confirmações suficientes) em lançamentos no ledger. A regra de negócio fala com o ledger, nunca com o trilho.

## Finalidade não é a mesma em todo lugar

Um Pix é final em segundos. Uma transação on-chain só é final depois de um número de confirmações, e pode ser revertida por uma reorganização da rede. O ledger precisa modelar isso de forma explícita, com estados como *pendente*, *confirmado* e *final*, em vez de fingir que todo trilho se comporta como o mais rápido.

## Conciliação como requisito de projeto

Conciliar não é uma tarefa de fim de mês. Cada lançamento deve carregar o identificador externo do trilho, e um processo contínuo compara o ledger com o extrato de cada adaptador. Divergências viram alertas, não planilhas.

Nada disso é exótico. É a disciplina de sempre, aplicada a mais de um tipo de trilho ao mesmo tempo.
