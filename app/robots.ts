import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/constants'

const DISALLOW_PATHS = ['/api/', '/ru/dev', '/kk/dev']

const AI_BOT_USER_AGENTS = [
  'GPTBot', // OpenAI / ChatGPT training crawler
  'ChatGPT-User', // ChatGPT live web browsing
  'OAI-SearchBot', // OpenAI SearchGPT
  'ClaudeBot', // Anthropic Claude
  'Claude-Web', // Anthropic web
  'anthropic-ai', // legacy Anthropic
  'PerplexityBot', // Perplexity
  'Perplexity-User', // Perplexity citation
  'Google-Extended', // Google AI training
  'Bingbot', // Bing (also feeds Copilot)
  'Applebot-Extended', // Apple AI training
  'CCBot', // Common Crawl
  'Bytespider', // ByteDance
  'YandexBot', // Yandex bot (in addition to existing Yandex group rule)
] as const

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOW_PATHS,
      },
      {
        userAgent: 'Yandex',
        allow: '/',
        disallow: DISALLOW_PATHS,
        crawlDelay: 1,
      },
      ...AI_BOT_USER_AGENTS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: DISALLOW_PATHS,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
