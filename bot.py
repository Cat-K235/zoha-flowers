"""
Zoha Flowers — Telegram Bot Backend
Handles order notifications and admin commands.
Requires: python-telegram-bot >= 20.0, python-dotenv
Install: pip install python-telegram-bot python-dotenv
"""

import os
import json
import logging
from datetime import datetime
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, MessageHandler, CallbackQueryHandler, filters, ContextTypes
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN  = os.getenv("BOT_TOKEN", "YOUR_BOT_TOKEN_HERE")
ADMIN_ID   = int(os.getenv("ADMIN_ID", "7477812838"))
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://your-domain.com")

logging.basicConfig(level=logging.INFO, format="%(asctime)s — %(name)s — %(levelname)s — %(message)s")
logger = logging.getLogger(__name__)

STATUS_LABELS = {
    0: "📋 Qabul qilindi",
    1: "🌸 Tayyorlanmoqda",
    2: "🚴 Kuryer yo'lda",
    3: "✅ Yetkazildi",
}


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    keyboard = [[
        InlineKeyboardButton(
            "🌸 Zoha Flowers ni ochish",
            web_app=WebAppInfo(url=WEBAPP_URL)
        )
    ]]
    await update.message.reply_text(
        f"Assalomu alaykum, {user.first_name}! 🌸\n\n"
        "Zoha Flowers — eng go'zal gullar siz uchun!\n"
        "24/7 yetkazib berish xizmati.",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )


async def handle_web_app_data(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle order data sent from Mini App"""
    try:
        data = json.loads(update.message.web_app_data.data)
        if data.get("type") != "order":
            return

        order_id   = data.get("orderId", "N/A")
        total      = data.get("total", 0)
        address    = data.get("address", "—")
        name       = data.get("recipientName", "—")
        phone      = data.get("phone", "—")
        date       = data.get("date", "—")
        time_slot  = data.get("time", "—")
        payment    = data.get("payment", "cash")
        greeting   = data.get("greeting", "")
        notes      = data.get("notes", "")
        items      = data.get("items", [])

        items_text = "\n".join([
            f"  • {item.get('name', '?')} ×{item.get('qty', 1)} — {item.get('price', 0):,} so'm"
            for item in items
        ])

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

        keyboard = [
            [
                InlineKeyboardButton("✅ Qabul qilindi", callback_data=f"status_{order_id}_0"),
                InlineKeyboardButton("🌸 Tayyorlanmoqda", callback_data=f"status_{order_id}_1"),
            ],
            [
                InlineKeyboardButton("🚴 Kuryer yo'lda", callback_data=f"status_{order_id}_2"),
                InlineKeyboardButton("✅ Yetkazildi", callback_data=f"status_{order_id}_3"),
            ],
        ]

        # Notify admin
        await context.bot.send_message(
            chat_id=ADMIN_ID,
            text=order_text,
            parse_mode="Markdown",
            reply_markup=InlineKeyboardMarkup(keyboard)
        )

        # Confirm to user
        await update.message.reply_text(
            f"✅ Buyurtmangiz qabul qilindi!\n\n"
            f"📦 Raqam: #{order_id}\n"
            f"🚚 Yetkazib berish: {date}, {time_slot}\n\n"
            f"Tez orada siz bilan bog'lanamiz! 🌸"
        )

        logger.info(f"New order #{order_id} from user {user.id}")

    except json.JSONDecodeError:
        logger.error("Invalid JSON data from WebApp")
    except Exception as e:
        logger.error(f"Error handling order: {e}")


async def handle_status_update(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle admin status button presses"""
    query = update.callback_query
    await query.answer()

    if query.from_user.id != ADMIN_ID:
        await query.answer("Ruxsat yo'q!", show_alert=True)
        return

    parts = query.data.split("_")
    if len(parts) != 3 or parts[0] != "status":
        return

    order_id   = parts[1]
    new_status = int(parts[2])
    label      = STATUS_LABELS.get(new_status, "?")

    await query.edit_message_text(
        query.message.text + f"\n\n🔄 *Status yangilandi:* {label}",
        parse_mode="Markdown"
    )

    logger.info(f"Order #{order_id} status → {new_status}")


async def admin_stats(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Admin command to show stats"""
    if update.effective_user.id != ADMIN_ID:
        return
    await update.message.reply_text(
        "📊 *Statistika*\n\nKengaytirilgan statistika tez orada...",
        parse_mode="Markdown"
    )


def main():
    app = Application.builder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start",  start))
    app.add_handler(CommandHandler("stats",  admin_stats))
    app.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_web_app_data))
    app.add_handler(CallbackQueryHandler(handle_status_update, pattern=r"^status_"))

    logger.info("Zoha Flowers Bot starting...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
