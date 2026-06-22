#!/usr/bin/env python3
"""Seed Carisma CRM with realistic dummy conversations and messages."""

import requests
import uuid
from datetime import datetime, timedelta, timezone

SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImducmlwZnJ2Y3hyYWtqaGl3bHh5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI0NzgzMywiZXhwIjoyMDkxODIzODMzfQ.kb_qbeaKU1NK1_Ie3GubD_WKVCFi9GV528132xFhCnQ"
BASE_URL = "https://gnripfrvcxrakjhiwlxy.supabase.co/rest/v1"

HEADERS = {
    "Authorization": f"Bearer {SERVICE_KEY}",
    "apikey": SERVICE_KEY,
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

def now():
    return datetime.now(timezone.utc)

def mins_ago(n):
    return (now() - timedelta(minutes=n)).isoformat()

def hours_ago(n):
    return (now() - timedelta(hours=n)).isoformat()

# Conversation templates
# contact_identifier is the single field for phone/email/handle
CONVERSATIONS = [
    {
        "id": str(uuid.uuid4()),
        "brand_id": "spa",
        "channel": "whatsapp",
        "contact_name": "Maria Borg",
        "contact_identifier": "+35699123456",
        "status": "open",
        "unread_count": 2,
        "waiting_since": mins_ago(7),
        "last_message_at": mins_ago(7),
        "messages": [
            {"body": "Hello, I'd like to book a deep tissue massage for next Saturday.", "direction": "inbound", "at": hours_ago(2)},
            {"body": "Hi Maria! Of course, we'd love to have you. Our deep tissue massage sessions are 60 or 90 minutes. Which would you prefer?", "direction": "outbound", "at": hours_ago(2)},
            {"body": "I think 90 minutes please. Also, do you have availability in the morning?", "direction": "inbound", "at": mins_ago(7)},
        ],
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": "aesthetics",
        "channel": "instagram",
        "contact_name": "Sophia Camilleri",
        "contact_identifier": "@sophiacamilleri",
        "status": "open",
        "unread_count": 1,
        "waiting_since": mins_ago(4),
        "last_message_at": mins_ago(4),
        "messages": [
            {"body": "Hi! I saw your post about the HydraFacial treatment. How much does it cost?", "direction": "inbound", "at": hours_ago(1)},
            {"body": "Hello Sophia! Our HydraFacial starts at €150 for a 45-minute session. It includes deep cleansing, exfoliation, and hydration. Would you like to know more?", "direction": "outbound", "at": hours_ago(1)},
            {"body": "Yes please! Is there a package deal if I book multiple sessions?", "direction": "inbound", "at": mins_ago(4)},
        ],
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": "slimming",
        "channel": "whatsapp",
        "contact_name": "Claire Vella",
        "contact_identifier": "+35699234567",
        "status": "open",
        "unread_count": 0,
        "waiting_since": None,
        "last_message_at": mins_ago(15),
        "messages": [
            {"body": "I've been struggling with my weight for 3 years. Can your program help someone like me?", "direction": "inbound", "at": hours_ago(3)},
            {"body": "Hi Claire, I really appreciate you reaching out and I want you to know you're in the right place. Our program is designed with compassion for exactly this journey. Can I ask — have you tried structured programs before?", "direction": "outbound", "at": hours_ago(3)},
            {"body": "Yes, I've tried a few. They work for a while but I always fall back.", "direction": "inbound", "at": hours_ago(2)},
            {"body": "That's so common, and it's not a failure — it means the program wasn't designed for long-term sustainability. Ours is different because we focus on habits, not just results. I'd love to set up a free consultation. When are you free this week?", "direction": "outbound", "at": mins_ago(15)},
        ],
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": "spa",
        "channel": "gmail",
        "contact_name": "Rebecca Zammit",
        "contact_identifier": "rebeccaz@gmail.com",
        "status": "open",
        "unread_count": 3,
        "waiting_since": mins_ago(12),
        "last_message_at": mins_ago(12),
        "messages": [
            {"body": "Good morning, I'm planning my hen party and would love to bring a group of 8 ladies for a spa day. Do you accommodate group bookings?", "direction": "inbound", "at": hours_ago(4)},
            {"body": "Good morning Rebecca! How exciting — a spa hen party sounds absolutely wonderful. Yes, we absolutely do group bookings and have special packages for exactly this occasion. How many ladies will be joining?", "direction": "outbound", "at": hours_ago(4)},
            {"body": "We are 8 ladies total including me. We were thinking of coming in late October?", "direction": "inbound", "at": hours_ago(2)},
            {"body": "Perfect! October is a beautiful time to visit. I'll prepare a bespoke package proposal for 8 guests and send it over shortly. Can I also ask your preferred date range?", "direction": "outbound", "at": hours_ago(1)},
            {"body": "We were thinking the 18th or 25th October. Looking forward to the proposal!", "direction": "inbound", "at": mins_ago(12)},
        ],
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": "aesthetics",
        "channel": "facebook",
        "contact_name": "Laura Mifsud",
        "contact_identifier": "laura.mifsud.fb",
        "status": "pending",
        "unread_count": 0,
        "waiting_since": None,
        "last_message_at": hours_ago(3),
        "messages": [
            {"body": "Do you do lip fillers? What brands do you use?", "direction": "inbound", "at": hours_ago(5)},
            {"body": "Hi Laura! Yes, we offer lip filler treatments using only premium HA fillers including Juvederm and Restylane. Our team will recommend the best product based on your goals. Would you like to book a free consultation first?", "direction": "outbound", "at": hours_ago(5)},
            {"body": "Yes I'd love that. Do I need to prepare anything?", "direction": "inbound", "at": hours_ago(4)},
            {"body": "Just avoid blood thinners like aspirin for 3 days before if possible, and come with a clean face. We'll take care of the rest! Our next available consultation is this Thursday. Does that work?", "direction": "outbound", "at": hours_ago(3)},
        ],
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": "slimming",
        "channel": "instagram",
        "contact_name": "Theresa Galea",
        "contact_identifier": "@theresagalea",
        "status": "open",
        "unread_count": 1,
        "waiting_since": mins_ago(25),
        "last_message_at": mins_ago(25),
        "messages": [
            {"body": "What's the difference between your basic and premium plan?", "direction": "inbound", "at": hours_ago(6)},
            {"body": "Great question Theresa! The basic plan includes weekly check-ins and a personalised meal plan. The premium adds bi-weekly 1-on-1 coaching, a full body composition analysis every month, and priority WhatsApp support. Most of our clients who start with basic upgrade within 3 months!", "direction": "outbound", "at": hours_ago(6)},
            {"body": "That sounds good. How long before I start seeing results?", "direction": "inbound", "at": mins_ago(25)},
        ],
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": "spa",
        "channel": "whatsapp",
        "contact_name": "Christina Farrugia",
        "contact_identifier": "+35699345678",
        "status": "closed",
        "unread_count": 0,
        "waiting_since": None,
        "last_message_at": hours_ago(5),
        "messages": [
            {"body": "Can I change my booking from 2pm to 4pm on Friday?", "direction": "inbound", "at": hours_ago(6)},
            {"body": "Of course Christina! I've moved your booking to 4pm on Friday. You'll receive a confirmation shortly. Looking forward to seeing you!", "direction": "outbound", "at": hours_ago(5)},
        ],
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": "aesthetics",
        "channel": "whatsapp",
        "contact_name": "Nicole Farrugia",
        "contact_identifier": "+35699456789",
        "status": "open",
        "unread_count": 1,
        "waiting_since": mins_ago(2),
        "last_message_at": mins_ago(2),
        "messages": [
            {"body": "Hi! I have a question about laser hair removal. Is it painful?", "direction": "inbound", "at": mins_ago(2)},
        ],
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": "slimming",
        "channel": "gmail",
        "contact_name": "Andrew Tabone",
        "contact_identifier": "andrewt@gmail.com",
        "status": "pending",
        "unread_count": 0,
        "waiting_since": None,
        "last_message_at": hours_ago(8),
        "messages": [
            {"body": "Dear Carisma Slimming, I'm a 45-year-old male with type 2 diabetes. Is your programme suitable for me? My doctor mentioned I should try a structured nutrition programme.", "direction": "inbound", "at": hours_ago(10)},
            {"body": "Dear Andrew, thank you for reaching out. We work with many clients who have type 2 diabetes, and our programme is designed to be medically sensitive. We'd want to work alongside your doctor's guidance. Could you share a bit more about your current diet and activity level? This will help us tailor the best approach.", "direction": "outbound", "at": hours_ago(9)},
            {"body": "I currently eat Mediterranean-style and do light walking 3x per week. My HbA1c is 6.8.", "direction": "inbound", "at": hours_ago(8)},
        ],
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": "spa",
        "channel": "instagram",
        "contact_name": "Francesca Pace",
        "contact_identifier": "@francescapace",
        "status": "closed",
        "unread_count": 0,
        "waiting_since": None,
        "last_message_at": hours_ago(12),
        "messages": [
            {"body": "Your spa looks amazing! Do you do gift vouchers?", "direction": "inbound", "at": hours_ago(13)},
            {"body": "Thank you so much, that's so kind! Yes, we have gift vouchers available in any amount, and we can customize them for specific treatments too. They're perfect gifts! You can order them directly on our website or pop into the spa. Would you like the link?", "direction": "outbound", "at": hours_ago(12)},
        ],
    },
]


def insert_conversations_and_messages():
    total_conv = 0
    total_msg = 0

    for conv in CONVERSATIONS:
        messages = conv.pop("messages", [])

        r = requests.post(
            f"{BASE_URL}/crm_conversations",
            headers={**HEADERS, "Prefer": "resolution=merge-duplicates,return=representation"},
            json=conv,
        )
        if r.status_code in (200, 201):
            total_conv += 1
        else:
            print(f"Conv error {conv.get('contact_name')}: {r.status_code} {r.text[:150]}")
            conv["messages"] = messages
            continue

        for i, msg in enumerate(messages):
            sent_at = msg.get("at", mins_ago(30 - i))
            r2 = requests.post(
                f"{BASE_URL}/crm_messages",
                headers=HEADERS,
                json={
                    "id": str(uuid.uuid4()),
                    "conversation_id": conv["id"],
                    "direction": msg["direction"],
                    "body": msg["body"],
                    "sent_at": sent_at,
                },
            )
            if r2.status_code in (200, 201):
                total_msg += 1
            else:
                print(f"Msg error: {r2.status_code} {r2.text[:150]}")

        conv["messages"] = messages

    print(f"Seeded {total_conv} conversations and {total_msg} messages")


if __name__ == "__main__":
    print("Skipping brand insert — brands are seeded by migration 001.")
    insert_conversations_and_messages()
