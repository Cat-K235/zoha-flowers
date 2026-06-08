"""
Zoha Flowers — Telegram Bot Backend
Handles order notifications, status updates, and customer alerts.

Install: pip install python-telegram-bot python-dotenv
Run:     python bot.py
"""

import os
import json
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import (
    Application, CommandHandler, MessageHandler,
    CallbackQueryHandler, filters, ContextTypes,
)
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN  = os.getenv("BOT_TOKEN")
ADMIN_ID   = int(os.getenv("ADMIN_ID", "7477812838"))
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://cat-k235.github.io/zoha-flowers")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s — %(name)s — %(levelname)s — %(message)s",
)
logger = logging.getLogger(__name__)

STATUS_LABELS = {
    0: "📋 Qabul qilindi",
    1: "🌸 Tayyorlanmoqda",
    2: "🚴 Kuryer yo'lda",
    3: "✅ Yetkazildi",
}

# Messages sent to the customer when admin updates their order status
CUSTOMER_MSGS = {
    "uz": {
        0: "📋 Buyurtmangiz #{id} qabul qilindi!\nTez orada tayyorlay boshlaymiz. 🌸",
        1: "🌸 Buyurtmangiz #{id} tayyorlanmoqda...",
        2: "🚴 Kuryer yo'lda! Buyurtmangiz #{id} tez orada yetib keladi.",
        3: "✅ Buyurtmangiz #{id} yetkazildi!\nXarid uchun rahmat! 🌸",
    },
    "ru": {
        0: "📋 Ваш заказ #{id} принят!\nМы начнём готовить его прямо сейчас. 🌸",
        1: "🌸 Ваш заказ #{id} готовится...",
        2: "🚴 Курьер в пути! Ваш заказ #{id} скоро будет у вас.",
        3: "✅ Ваш заказ #{id} доставлен!\nСпасибо за покупку! 🌸",
    },
    "en": {
        0: "📋 Your order #{id} has been accepted!\nWe'll start preparing it right away. 🌸",
        1: "🌸 Your order #{id} is being prepared...",
        2: "🚴 Courier is on the way! Your order #{id} will arrive soon.",
        3: "✅ Your order #{id} has been delivered!\nThank you for your purchase! 🌸",
    },
}


# ── Helpers ───────────────────────────────────────────────────────────────────

def status_keyboard(order_id: str, chat_id, lang: str) -> InlineKeyboardMarkup:
    """Build 2×2 status button grid. callback_data: status_{id}_{n}_{chat_id}_{lang}"""
    def btn(label: str, n: int) -> InlineKeyboardButton:
        return InlineKeyboardButton(label, callback_data=f"status_{order_id}_{n}_{chat_id}_{lang}")
    return InlineKeyboardMarkup([
        [btn("📋 Qabul",        0), btn("🌸 Tayyorlanmoqda", 1)],
        [btn("🚴 Kuryer yo'lda", 2), btn("✅ Yetkazildi",      3)],
    ])


# ── Handlers ──────────────────────────────────────────────────────────────────

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [[InlineKeyboardButton("🌸 Zoha Flowers ni ochish", web_app=WebAppInfo(url=WEBAPP_URL))]]
    await update.message.reply_text(
        f"Assalomu alaykum, {update.effective_user.first_name}! 🌸\n\n"
        "Zoha Flowers — eng go'zal gullar siz uchun!\n"
        "24/7 yetkazib berish xizmati.",
        reply_markup=InlineKeyboardMarkup(keyboard),
    )


async def admin_help(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id != ADMIN_ID:
        return
    await update.message.reply_text(
        "🌸 *Zoha Flowers Bot — Admin*\n\n"
        "/start — Botni ishga tushirish\n"
        "/stats — Statistika\n"
        "/help  — Ushbu yordam\n\n"
        "Yangi buyurtma kelganda statusni tugmalar orqali yangilang.\n"
        "Mijoz avtomatik xabar oladi. ✅",
        parse_mode="Markdown",
    )


async def admin_stats(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id != ADMIN_ID:
        return
    await update.message.reply_text(
        "📊 *Statistika*\n\n"
        "Kengaytirilgan statistika mini-app admin panelida mavjud.",
        parse_mode="Markdown",
    )


async def handle_web_app_data(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Receive order JSON from the Mini App, forward to admin, confirm to customer."""
    try:
        data = json.loads(update.message.web_app_data.data)
        if data.get("type") != "order":
            return

        order_id  = data.get("orderId", "N/A")
        total     = data.get("total", 0)
        address   = data.get("address", "—")
        name      = data.get("recipientName", "—")
        phone     = data.get("phone", "—")
        date      = data.get("date", "—")
        time_slot = data.get("time", "—")
        payment   = data.get("payment", "cash")
        greeting  = data.get("greeting", "")
        notes     = data.get("notes", "")
        items     = data.get("items", [])
        lang      = data.get("lang", "uz")
        # Fall back to the sender's id if Mini App didn't supply chatId
        chat_id   = data.get("chatId") or update.effective_user.id

        items_text = "\n".join(
            f"  • {item.get('name', '?')} ×{item.get('qty', 1)} — {item.get('price', 0):,} so'm"
            for item in items
        )

        user = update.effective_user
        order_text = (
            f"🌸 *YANGI BUYURTMA* 🌸\n"
            f"━━━━━━━━━━━━━━━━━━\n"
            f"📦 Raqam: `#{order_id}`\n"
            f"👤 Mijoz: [{user.first_name}](tg://user?id={user.id})\n"
            f"📞 Telefon: `{phone}`\n"
            f"🏠 Manzil: {address}\n"
            f"📅 Sana: {date} | {time_slot}\n"
            f"💳 To'lov: {'💵 Naqd' if payment == 'cash' else '💳 Karta'}\n"
            f"━━━━━━━━━━━━━━━━━━\n"
            f"🛒 *Mahsulotlar:*\n{items_text}\n"
            f"━━━━━━━━━━━━━━━━━━\n"
            f"💰 *Jami: {total:,} so'm*"
        )
        if greeting:
            order_text += f"\n\n💌 Tabriq: _{greeting}_"
        if notes:
            order_text += f"\n📝 Izoh: {notes}"

        await context.bot.send_message(
            chat_id=ADMIN_ID,
            text=order_text,
            parse_mode="Markdown",
            reply_markup=status_keyboard(order_id, chat_id, lang),
        )

        # Confirm receipt to customer
        await update.message.reply_text(
            f"✅ Buyurtmangiz qabul qilindi!\n\n"
            f"📦 Raqam: #{order_id}\n"
            f"🚚 Yetkazib berish: {date}, {time_slot}\n\n"
            f"Tez orada siz bilan bog'lanamiz! 🌸"
        )

        logger.info("New order #%s from user %s (chat_id=%s)", order_id, user.id, chat_id)

    except json.JSONDecodeError:
        logger.error("Invalid JSON from WebApp")
    except Exception as exc:
        logger.error("Error handling order: %s", exc)


async def handle_status_update(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Admin taps a status button — update the order message and notify the customer."""
    query = update.callback_query

    if query.from_user.id != ADMIN_ID:
        await query.answer("Ruxsat yo'q!", show_alert=True)
        return

    await query.answer()

    # callback_data: status_{order_id}_{status}_{chat_id}_{lang}
    parts = query.data.split("_")
    if len(parts) < 3 or parts[0] != "status":
        return

    order_id   = parts[1]
    new_status = int(parts[2])
    chat_id    = int(parts[3]) if len(parts) > 3 else None
    lang       = parts[4]     if len(parts) > 4 else "uz"
    label      = STATUS_LABELS.get(new_status, "?")

    # Replace any previous status line rather than appending
    original = query.message.text
    if "\n\n🔄" in original:
        original = original[:original.rfind("\n\n🔄")]
    await query.edit_message_text(
        original + f"\n\n🔄 *Status:* {label}",
        parse_mode="Markdown",
        reply_markup=query.message.reply_markup,
    )

    # Notify the customer in their language
    if chat_id:
        msgs = CUSTOMER_MSGS.get(lang, CUSTOMER_MSGS["uz"])
        msg  = msgs.get(new_status, "").replace("{id}", order_id)
        if msg:
            try:
                await context.bot.send_message(chat_id=chat_id, text=msg)
            except Exception as exc:
                logger.warning("Could not notify customer %s: %s", chat_id, exc)

    logger.info("Order #%s status → %s", order_id, new_status)


# ── Entry point ───────────────────────────────────────────────────────────────

def main():
    app = Application.builder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help",  admin_help))
    app.add_handler(CommandHandler("stats", admin_stats))
    app.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_web_app_data))
    app.add_handler(CallbackQueryHandler(handle_status_update, pattern=r"^status_"))

    logger.info("Zoha Flowers Bot starting...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
