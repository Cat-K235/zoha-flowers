"""
Zoxa Flowers — Telegram Bot Backend
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

BOT_TOKEN       = os.getenv("BOT_TOKEN")
ADMIN_IDS       = [int(x) for x in os.getenv("ADMIN_IDS", "8748057822,7498042030").split(",")]
MANAGER_CHAT_ID = os.getenv("MANAGER_CHAT_ID")
WEBAPP_URL      = os.getenv("WEBAPP_URL", "https://cat-k235.github.io/zoha-flowers")

pending_orders = {}
order_meta = {}

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

def order_delivery_label(lang: str) -> str:
    return {
        "uz": "📅 Yetkazib berish vaqti",
        "ru": "📅 Время доставки",
        "en": "📅 Delivery time",
    }.get(lang, "📅 Delivery time")


def status_keyboard(order_id: str, chat_id, lang: str) -> InlineKeyboardMarkup:
    """Build 2×2 status button grid plus a delivery notification button."""
    def btn(label: str, n: int) -> InlineKeyboardButton:
        return InlineKeyboardButton(label, callback_data=f"status_{order_id}_{n}_{chat_id}_{lang}")
    return InlineKeyboardMarkup([
        [btn("📋 Qabul",        0), btn("🌸 Tayyorlanmoqda", 1)],
        [btn("🚴 Kuryer yo'lda", 2), btn("✅ Yetkazildi",      3)],
        [InlineKeyboardButton("🕒 Yetkazib berish", callback_data=f"notify_{order_id}_{chat_id}_{lang}")],
    ])


def confirm_reject_keyboard(order_id: str, chat_id, lang: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton("✅ Tasdiqlash", callback_data=f"confirm_{order_id}_{chat_id}_{lang}"),
            InlineKeyboardButton("❌ Rad etish", callback_data=f"reject_{order_id}_{chat_id}_{lang}"),
        ],
    ])


def get_manager_targets():
    if MANAGER_CHAT_ID:
        return [int(x) for x in MANAGER_CHAT_ID.split(",")]
    return ADMIN_IDS




# ── Handlers ──────────────────────────────────────────────────────────────────

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [[InlineKeyboardButton("🌸 Zoxa Flowers ni ochish", web_app=WebAppInfo(url=WEBAPP_URL))]]
    await update.message.reply_text(
        f"Assalomu alaykum, {update.effective_user.first_name}! 🌸\n\n"
        "Zoxa Flowers — eng go'zal gullar siz uchun!\n"
        "24/7 yetkazib berish xizmati.",
        reply_markup=InlineKeyboardMarkup(keyboard),
    )


async def admin_help(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id not in ADMIN_IDS:
        return
    await update.message.reply_text(
        "🌸 *Zoxa Flowers Bot — Admin*\n\n"
        "/start — Botni ishga tushirish\n"
        "/stats — Statistika\n"
        "/help  — Ushbu yordam\n\n"
        "Yangi buyurtma kelganda statusni tugmalar orqali yangilang.\n"
        "Mijoz avtomatik xabar oladi. ✅",
        parse_mode="Markdown",
    )


async def admin_stats(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id not in ADMIN_IDS:
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
        message_type = data.get("type")
        if message_type == "delivery_update":
            await handle_delivery_update(data, update, context)
            return

        if message_type != "order":
            return

        order_id    = data.get("orderId", "N/A")
        total       = data.get("total", 0)
        address     = data.get("address", "—")
        name        = data.get("recipientName", "—")
        phone       = data.get("phone", "—")
        date        = data.get("date", "—")
        time_slot   = data.get("time", "—")
        payment     = data.get("payment", "cash")
        greeting    = data.get("greeting", "")
        notes       = data.get("notes", "")
        items       = data.get("items", [])
        lang        = data.get("lang", "uz")
        screenshot  = data.get("paymentScreenshot", "")
        chat_id     = data.get("chatId") or update.effective_user.id

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

        for admin_id in ADMIN_IDS:
            await context.bot.send_message(
                chat_id=admin_id,
                text=order_text,
                parse_mode="Markdown",
                reply_markup=status_keyboard(order_id, chat_id, lang),
            )

        manager_text = order_text + "\n\n⏳ *Tasdiqlash kutilmoqda...*"
        for mgr_id in get_manager_targets():
            await context.bot.send_message(
                chat_id=mgr_id,
                text=manager_text,
                parse_mode="Markdown",
                reply_markup=confirm_reject_keyboard(order_id, chat_id, lang),
            )
        if payment == "card" and screenshot:
            for mgr_id in get_manager_targets():
                await context.bot.send_photo(
                    chat_id=mgr_id,
                    photo=screenshot,
                    caption=f"💳 To'lov screenshoti — Buyurtma `#{order_id}`",
                    parse_mode="Markdown",
                )

        # Store order metadata so we can notify the customer later with delivery details
        order_meta[order_id] = {
            "chat_id": chat_id,
            "lang": lang,
            "delivery": f"{date} {time}",
        }

        confirm_msgs = {
            "uz": f"✅ Buyurtmangiz qabul qilindi!\n\n📦 Raqam: #{order_id}\n🚚 Yetkazib berish: {date}, {time_slot}",
            "ru": f"✅ Ваш заказ принят!\n\n📦 Номер: #{order_id}\n🚚 Доставка: {date}, {time_slot}",
            "en": f"✅ Your order has been received!\n\n📦 Order: #{order_id}\n🚚 Delivery: {date}, {time_slot}",
        }
        receipt = confirm_msgs.get(lang, confirm_msgs["uz"])

        await update.message.reply_text(receipt + "\n\nTez orada siz bilan bog'lanamiz! 🌸")
        logger.info("New order #%s from user %s (chat_id=%s)", order_id, user.id, chat_id)

    except json.JSONDecodeError:
        logger.error("Invalid JSON from WebApp")
    except Exception as exc:
        logger.error("Error handling order: %s", exc)


async def handle_delivery_update(data: dict, update: Update, context: ContextTypes.DEFAULT_TYPE):
    order_id = data.get("orderId")
    chat_id  = data.get("chatId")
    lang     = data.get("lang", "uz")
    delivery = data.get("delivery") or order_meta.get(order_id, {}).get("delivery")
    custom   = data.get("message", "")

    if not order_id or not chat_id or not delivery:
        return

    order_meta.setdefault(order_id, {})["delivery"] = delivery

    msg = {
        "uz": f"📣 Buyurtmangiz #{order_id} uchun yangilanish:\n📅 Yetkazib berish: {delivery}",
        "ru": f"📣 Обновление по заказу #{order_id}:\n📅 Доставка: {delivery}",
        "en": f"📣 Update for order #{order_id}:\n📅 Delivery: {delivery}",
    }.get(lang, f"📣 Update for order #{order_id}:\n📅 Delivery: {delivery}")

    accepted_time = data.get("acceptedTime")
    delivered_time = data.get("deliveredTime")
    if accepted_time:
        msg += f"\n✅ Qabul vaqti: {accepted_time}"
    if delivered_time:
        msg += f"\n📦 Yetkazib berilgan vaqt: {delivered_time}"

    if custom:
        msg += f"\n\n{custom}"

    try:
        await context.bot.send_message(chat_id=chat_id, text=msg)
    except Exception as exc:
        logger.warning("Could not notify customer %s: %s", chat_id, exc)

    if update.message:
        try:
            await update.message.reply_text("Yetkazib berish vaqti yuborildi. 🌸")
        except Exception:
            pass


async def handle_payment_photo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Forward payment screenshot from customer to manager chat."""
    user_id = update.effective_user.id
    order_id = pending_orders.pop(user_id, None)
    if not order_id:
        return

    user = update.effective_user
    caption = (
        f"💳 *To'lov screenshoti*\n"
        f"📦 Buyurtma: `#{order_id}`\n"
        f"👤 Mijoz: [{user.first_name}](tg://user?id={user.id})"
    )
    for mgr_id in get_manager_targets():
        await context.bot.send_photo(
            chat_id=mgr_id,
            photo=update.message.photo[-1].file_id,
            caption=caption,
            parse_mode="Markdown",
        )

    await update.message.reply_text("✅ To'lov screenshoti qabul qilindi! Tez orada tasdiqlanadi. 🌸")
    logger.info("Payment photo for order #%s from user %s", order_id, user_id)


async def handle_confirm_reject(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Manager confirms or rejects an order."""
    query = update.callback_query

    if query.from_user.id not in ADMIN_IDS and query.from_user.id not in get_manager_targets():
        await query.answer("Ruxsat yo'q!", show_alert=True)
        return

    await query.answer()

    parts = query.data.split("_")
    action   = parts[0]
    order_id = parts[1]
    chat_id  = int(parts[2]) if len(parts) > 2 else None
    lang     = parts[3] if len(parts) > 3 else "uz"

    original = query.message.text
    if "\n\n⏳" in original:
        original = original[:original.rfind("\n\n⏳")]
    if "\n\n✅ TASDIQLANDI" in original or "\n\n❌ RAD ETILDI" in original:
        await query.answer("Bu buyurtma allaqachon ko'rib chiqilgan!", show_alert=True)
        return

    if action == "confirm":
        await query.edit_message_text(
            original + f"\n\n✅ *TASDIQLANDI* — {query.from_user.first_name}",
            parse_mode="Markdown",
        )
        if chat_id:
            msgs = {
                "uz": f"✅ Buyurtmangiz #{order_id} tasdiqlandi!\nGullaringiz tayyorlanmoqda! 🌸",
                "ru": f"✅ Ваш заказ #{order_id} подтверждён!\nМы готовим ваши цветы! 🌸",
                "en": f"✅ Your order #{order_id} has been confirmed!\nWe're preparing your flowers! 🌸",
            }
            try:
                await context.bot.send_message(chat_id=chat_id, text=msgs.get(lang, msgs["uz"]))
            except Exception as exc:
                logger.warning("Could not notify customer %s: %s", chat_id, exc)
        logger.info("Order #%s CONFIRMED by %s", order_id, query.from_user.id)

    elif action == "reject":
        await query.edit_message_text(
            original + f"\n\n❌ *RAD ETILDI* — {query.from_user.first_name}",
            parse_mode="Markdown",
        )
        if chat_id:
            msgs = {
                "uz": f"❌ Buyurtmangiz #{order_id} rad etildi.\nIltimos, to'lov ma'lumotlarini tekshiring yoki biz bilan bog'laning: @Zoxaflowers",
                "ru": f"❌ Ваш заказ #{order_id} отклонён.\nПожалуйста, проверьте данные оплаты или свяжитесь с нами: @Zoxaflowers",
                "en": f"❌ Your order #{order_id} was rejected.\nPlease check your payment details or contact us: @Zoxaflowers",
            }
            try:
                await context.bot.send_message(chat_id=chat_id, text=msgs.get(lang, msgs["uz"]))
            except Exception as exc:
                logger.warning("Could not notify customer %s: %s", chat_id, exc)
        logger.info("Order #%s REJECTED by %s", order_id, query.from_user.id)


async def handle_status_update(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Admin taps a status button — update the order message and notify the customer."""
    query = update.callback_query

    if query.from_user.id not in ADMIN_IDS:
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
        note = delivery_note(order_id, lang)
        if note:
            msg += f"\n\n{note}"
        if msg:
            try:
                await context.bot.send_message(chat_id=chat_id, text=msg)
            except Exception as exc:
                logger.warning("Could not notify customer %s: %s", chat_id, exc)

    logger.info("Order #%s status → %s", order_id, new_status)


async def handle_notify_delivery(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query

    if query.from_user.id not in ADMIN_IDS:
        await query.answer("Ruxsat yo'q!", show_alert=True)
        return

    await query.answer()

    parts = query.data.split("_")
    if len(parts) < 2 or parts[0] != "notify":
        return

    order_id = parts[1]
    chat_id  = int(parts[2]) if len(parts) > 2 else None
    lang     = parts[3] if len(parts) > 3 else "uz"
    note     = delivery_note(order_id, lang)

    if note and chat_id:
        msg = {
            "uz": f"📣 Buyurtmangiz #{order_id} haqida yangilanish:\n{note}",
            "ru": f"📣 Обновление по вашему заказу #{order_id}:\n{note}",
            "en": f"📣 Update for your order #{order_id}:\n{note}",
        }.get(lang, f"📣 Update for your order #{order_id}:\n{note}")
        try:
            await context.bot.send_message(chat_id=chat_id, text=msg)
        except Exception as exc:
            logger.warning("Could not notify customer %s: %s", chat_id, exc)

    await query.answer("Yetkazib berish vaqti yuborildi.")
    logger.info("Delivery note sent for order #%s", order_id)


# ── Entry point ───────────────────────────────────────────────────────────────

def main():
    app = Application.builder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help",  admin_help))
    app.add_handler(CommandHandler("stats", admin_stats))
    app.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_web_app_data))
    app.add_handler(MessageHandler(filters.PHOTO & ~filters.StatusUpdate.WEB_APP_DATA, handle_payment_photo))
    app.add_handler(CallbackQueryHandler(handle_confirm_reject, pattern=r"^(confirm|reject)_"))
    app.add_handler(CallbackQueryHandler(handle_status_update, pattern=r"^status_"))
    app.add_handler(CallbackQueryHandler(handle_notify_delivery, pattern=r"^notify_"))

    logger.info("Zoxa Flowers Bot starting...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
