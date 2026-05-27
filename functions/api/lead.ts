// Cloudflare Pages Function: приём лидов с формы → D1 SQLite + опционально Telegram.
// Endpoint: POST /api/lead
//
// Bindings (wrangler.toml):
//   DB           — D1 база kalkremont-leads
// Опционально env (Pages → Settings → Environment variables):
//   TG_BOT_TOKEN — токен бота, для алертов в реальном времени
//   TG_CHAT_ID   — chat_id куда слать алерт
//
// Если TG не настроен — заявка всё равно сохраняется в БД.

interface LeadBody {
  context?: string;
  city?: string;
  district?: string;
  area?: string | number;
  rooms?: string;
  name?: string;
  phone?: string;
  notes?: string;
  utm?: Record<string, string>;
  page?: string;
  referrer?: string;
  // Расширенные поля для сети 11 доменов:
  source?: string;   // ID формы / места размещения
  host?: string;     // например 'ipoteka-remont.ru' или 'vannye.kalkremont.ru'
  url?: string;      // полный URL страницы
  niche?: string;    // 'Ипотека на ремонт' / 'Кухни на заказ' и т.д.
  service?: string;  // slug услуги если есть
  type?: string;     // тип ремонта если выбран
  ts?: number;       // timestamp клиента
}

interface Env {
  DB: D1Database;
  TG_BOT_TOKEN?: string;
  TG_CHAT_ID?: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400'
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS }
  });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function sendTelegram(env: Env, b: LeadBody, leadId: number, ip: string) {
  const token = env.TG_BOT_TOKEN;
  const chatId = env.TG_CHAT_ID;
  if (!token || !chatId) return { sent: false, reason: 'no_telegram_configured' };

  const lines: string[] = [];

  // Заголовок с пометкой проекта/ниши
  const projectIcon = b.niche ? '🎯' : '🔔';
  lines.push(`<b>${projectIcon} Заявка #${leadId}</b>`);

  // Откуда — самое важное в начале
  if (b.host) lines.push(`<b>🌐 Сайт:</b> ${escapeHtml(b.host)}`);
  if (b.niche) lines.push(`<b>📦 Ниша:</b> ${escapeHtml(b.niche)}`);
  if (b.source) lines.push(`<b>📍 Форма:</b> ${escapeHtml(b.source)}`);

  // Контакт — критически важно
  lines.push('');
  if (b.phone) lines.push(`<b>📞 Телефон:</b> <code>${escapeHtml(b.phone)}</code>`);
  if (b.name) lines.push(`<b>👤 Имя:</b> ${escapeHtml(b.name)}`);

  // Что хочет
  lines.push('');
  if (b.service) lines.push(`<b>🛒 Услуга:</b> ${escapeHtml(b.service)}`);
  if (b.type) lines.push(`<b>🔧 Тип:</b> ${escapeHtml(b.type)}`);
  if (b.context) lines.push(`<b>📝 Что:</b> ${escapeHtml(b.context)}`);
  if (b.city) lines.push(`<b>🏙 Город:</b> ${escapeHtml(b.city)}`);
  if (b.district) lines.push(`<b>📍 Район:</b> ${escapeHtml(b.district)}`);
  if (b.area) lines.push(`<b>📐 Площадь:</b> ${escapeHtml(String(b.area))} м²`);
  if (b.rooms) lines.push(`<b>🚪 Комнат:</b> ${escapeHtml(b.rooms)}`);
  if (b.notes) lines.push(`<b>💬 Комментарий:</b> ${escapeHtml(b.notes)}`);

  // UTM-метки
  if (b.utm && Object.keys(b.utm).length > 0) {
    lines.push('');
    lines.push(`<b>📊 UTM:</b>`);
    for (const [k, v] of Object.entries(b.utm)) {
      lines.push(`  ${escapeHtml(k)}=${escapeHtml(v)}`);
    }
  }

  // Технические данные внизу
  lines.push('');
  if (b.url) lines.push(`<b>🔗 Страница:</b> ${escapeHtml(b.url)}`);
  else if (b.page) lines.push(`<b>🔗 Путь:</b> ${escapeHtml(b.page)}`);
  if (b.referrer) lines.push(`<b>↩️ Referrer:</b> ${escapeHtml(b.referrer)}`);
  lines.push(`<i>🌐 IP: ${escapeHtml(ip)}</i>`);

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId, text: lines.join('\n'),
        parse_mode: 'HTML', disable_web_page_preview: true
      })
    });
    const j = await r.json() as { ok?: boolean; description?: string };
    return { sent: !!j.ok, reason: j.description };
  } catch (e) {
    return { sent: false, reason: 'telegram_exception' };
  }
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { request, env } = ctx;

  let body: LeadBody;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400);
  }

  // Валидация
  if (!body.phone && !body.name) {
    return json({ ok: false, error: 'missing_contact' }, 400);
  }
  if (body.phone && body.phone.replace(/\D/g, '').length < 7) {
    return json({ ok: false, error: 'invalid_phone' }, 400);
  }

  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const ua = request.headers.get('user-agent') || '';

  // Если D1 не привязан — отвечаем 503 (но не теряем заявку — пишем в console.log)
  if (!env.DB) {
    console.warn('[lead] D1 not bound, lead:', JSON.stringify(body));
    return json({ ok: false, error: 'db_not_configured', detail: 'CF Pages не имеет binding к D1 базе. Свяжитесь с админом.' }, 503);
  }

  // Запись в D1. context теперь содержит JSON со всеми расширенными полями.
  const enrichedContext = JSON.stringify({
    context: body.context,
    host: body.host,
    niche: body.niche,
    source: body.source,
    service: body.service,
    type: body.type,
    url: body.url,
    ts: body.ts
  });

  let leadId = 0;
  try {
    const result = await env.DB.prepare(
      `INSERT INTO leads
       (created_at, context, city, district, area, rooms_type, name, phone, notes, page, referrer, utm, ip, user_agent, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`
    )
    .bind(
      Date.now(),
      enrichedContext,
      body.city || null,
      body.district || null,
      body.area ? String(body.area) : null,
      body.rooms || null,
      body.name || null,
      body.phone || null,
      body.notes || null,
      body.page || body.url || null,
      body.referrer || null,
      body.utm ? JSON.stringify(body.utm) : null,
      ip,
      ua.slice(0, 500)
    )
    .run();
    leadId = (result.meta?.last_row_id as number) || 0;
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    console.error('[lead] D1 insert failed:', errMsg);
    return json({ ok: false, error: 'db_write_failed', detail: errMsg }, 500);
  }

  // Опциональный алерт в TG (не блокирует ответ)
  const tg = await sendTelegram(env, body, leadId, ip);

  return json({
    ok: true,
    stored: true,
    lead_id: leadId,
    telegram: tg.sent
  });
};
