#!/usr/bin/env python3
"""
Simple utility script to test sending a Telegram message using credentials from secrets.yml
"""

import requests
import yaml
import sys


def load_secrets(filepath='../secrets.yml'):
    """Load secrets from YAML file"""
    try:
        with open(filepath, 'r') as f:
            secrets = yaml.safe_load(f)
        return secrets
    except FileNotFoundError:
        print(f"Error: {filepath} not found")
        sys.exit(1)
    except yaml.YAMLError as e:
        print(f"Error parsing YAML: {e}")
        sys.exit(1)


def send_telegram_message(bot_token, chat_id, message):
    """Send a message via Telegram Bot API"""
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"

    payload = {
        'chat_id': chat_id,
        'text': message,
        'parse_mode': 'HTML'
    }

    try:
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()

        result = response.json()
        if result.get('ok'):
            print("Message sent successfully!")
            print(f"Message ID: {result['result']['message_id']}")
            return True
        else:
            print(f"Failed to send message: {result.get('description', 'Unknown error')}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"HTTP request failed: {e}")
        return False


def main():
    secrets = load_secrets()
    bot_token = secrets.get('telegram_bot_auth_token')
    chat_id = secrets.get('telegram_chat_id')

    if not bot_token or not chat_id:
        print("Error: telegram_bot_auth_token and telegram_chat_id must be set in secrets.yml")
        sys.exit(1)

    if len(sys.argv) > 1:
        message = ' '.join(sys.argv[1:])
    else:
        message = f"The ID of this chat is {chat_id}"

    print(f"Sending message to chat {chat_id}...")
    print(f"Message: {message}\n")

    success = send_telegram_message(bot_token, chat_id, message)
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
