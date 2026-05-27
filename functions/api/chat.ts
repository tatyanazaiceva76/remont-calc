// CF Pages Function /api/chat — Workers AI (Llama-3.1-8b) — БЕСПЛАТНО без блокировок РФ.
// Запрос: POST /api/chat { message, context, source }
// Лимит: 10 req/IP/день через KV (или без KV если не привязан).

interface Env {
  AI: Ai;
  CHAT_KV?: KVNamespace;
  DB?: D1Database;
}

interface ChatRequest {
  message: string;
  context?: { type?: string; area?: string; city?: string; niche?: string };
  source: string;
}

const RATE_LIMIT_PER_IP = 15;
const MAX_INPUT_CHARS = 500;
const MAX_OUTPUT_TOKENS = 200;

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

const SYSTEM_PROMPT = `Ты Анна — консультант по ремонту квартир. Помогаешь клиенту определиться с типом ремонта и оставить заявку.
Отвечай КРАТКО (1-3 предложения, до 200 символов). На русском.
Если клиент готов — попроси телефон.
Если спрашивает цену — называй диапазон: косметика 7-15к₽/м², капитал 18-35к₽/м², премиум 35-80к₽/м².
Не давай юридических, финансовых, медицинских советов.`;

export const onRequest: PagesFunction<Env> = async (ctx) => {
  if (ctx.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }
  if (ctx.request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders() });
  }

  try {
    const body = (await ctx.request.json()) as ChatRequest;
    const message = (body.message || '').slice(0, MAX_INPUT_CHARS);
    if (!message) {
      return new Response(JSON.stringify({ error: 'empty message' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
    }

    // Rate limit по IP (если KV привязан)
    const today = new Date().toISOString().slice(0, 10);
    const ip = ctx.request.headers.get('cf-connecting-ip') || 'unknown';
    if (ctx.env.CHAT_KV) {
      const ipKey = `chat:ip:${today}:${ip}`;
      const ipCount = parseInt((await ctx.env.CHAT_KV.get(ipKey)) || '0', 10);
      if (ipCount >= RATE_LIMIT_PER_IP) {
        return new Response(JSON.stringify({
          reply: 'Вы превысили лимит сообщений на сегодня. Оставьте телефон — менеджер свяжется с вами!',
          fallback: true
        }), { headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
      }
      await ctx.env.CHAT_KV.put(ipKey, String(ipCount + 1), { expirationTtl: 86400 * 2 });
    }

    // Build context
    let contextLine = '';
    if (body.context?.niche) contextLine = `Клиент на сайте "${body.context.niche}". `;
    if (body.context?.city) contextLine += `Город: ${body.context.city}. `;
    if (body.context?.type) contextLine += `Тип ремонта: ${body.context.type}. `;
    if (body.context?.area) contextLine += `Площадь: ${body.context.area} м². `;

    // Workers AI — Llama 3.1 8b — бесплатная и быстрая
    if (!ctx.env.AI) {
      return new Response(JSON.stringify({
        reply: 'Чат-бот ещё настраивается. Оставьте телефон в форме — менеджер свяжется!',
        fallback: true,
        debug: 'AI binding missing'
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
    }

    const response = await ctx.env.AI.run('@cf/meta/llama-3.1-8b-instruct' as any, {
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + (contextLine ? '\nКонтекст: ' + contextLine : '') },
        { role: 'user', content: message }
      ],
      max_tokens: MAX_OUTPUT_TOKENS
    });

    const reply = (response as any).response || 'Извините, не понял. Можете уточнить?';

    // Log to D1
    if (ctx.env.DB) {
      try {
        await ctx.env.DB.prepare(
          'INSERT INTO chat_logs (ts, source, ip, message_preview, reply_preview) VALUES (?, ?, ?, ?, ?)'
        ).bind(
          Date.now(), body.source || 'unknown', ip,
          message.slice(0, 100), reply.slice(0, 200)
        ).run();
      } catch {}
    }

    return new Response(JSON.stringify({ reply, model: 'llama-3.1-8b-instruct' }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    });

  } catch (e: any) {
    console.error('Chat error:', e);
    return new Response(JSON.stringify({
      reply: 'Ошибка обработки. Оставьте телефон — менеджер свяжется!',
      fallback: true,
      error: String(e?.message || e).slice(0, 200)
    }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  }
};
