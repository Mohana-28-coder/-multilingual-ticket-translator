import logging
import google.generativeai as genai
from ..config import settings

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.gemini_available = False
        try:
            api_key = settings.GEMINI_API_KEY
            if api_key:
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
                self.gemini_available = True
                logger.info("Gemini AI initialized successfully")
        except Exception as e:
            logger.warning(f"Gemini not available: {e}")

    async def generate_response_suggestion(
        self,
        ticket_subject: str,
        ticket_description: str,
        previous_responses: list = None
    ) -> str:
        prompt = self._build_support_prompt(
            ticket_subject,
            ticket_description,
            previous_responses
        )
        if self.gemini_available:
            return await self._generate_with_gemini(prompt)
        return self._generate_fallback_response(
            ticket_subject,
            ticket_description
        )

    def _build_support_prompt(
        self,
        subject: str,
        description: str,
        previous_responses: list = None
    ) -> str:
        prompt = f"""You are a professional customer support agent. 
Generate a helpful, polite and professional response 
to the following support ticket.

TICKET SUBJECT: {subject}

TICKET DESCRIPTION: {description}

"""
        if previous_responses:
            prompt += "PREVIOUS RESPONSES:\n"
            for resp in previous_responses:
                prompt += f"- {resp}\n"
            prompt += "\n"

        prompt += """Please provide a professional response that:
1. Acknowledges the customer's concern
2. Provides helpful information or solution
3. Offers further assistance if needed
4. Maintains a friendly and professional tone

RESPONSE:"""
        return prompt

    async def _generate_with_gemini(self, prompt: str) -> str:
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            return self._generate_fallback_response("", "")

    def _generate_fallback_response(
        self,
        subject: str,
        description: str
    ) -> str:
        return """Thank you for reaching out to our support team.

We have received your ticket and our team is reviewing \
your request. We will provide you with a detailed \
response shortly.

If you have any additional information that might help \
us assist you better, please feel free to share it.

We appreciate your patience and are committed to \
resolving your concern as quickly as possible.

Best regards,
Support Team"""

    async def analyze_sentiment(self, text: str) -> dict:
        try:
            negative_keywords = [
                'angry', 'frustrated', 'terrible',
                'worst', 'hate', 'disappointed',
                'urgent', 'immediately'
            ]
            positive_keywords = [
                'thank', 'great', 'excellent',
                'happy', 'pleased', 'appreciate',
                'wonderful'
            ]
            text_lower = text.lower()
            negative_count = sum(
                1 for word in negative_keywords
                if word in text_lower
            )
            positive_count = sum(
                1 for word in positive_keywords
                if word in text_lower
            )
            if negative_count > positive_count:
                sentiment = "negative"
                priority = "high"
            elif positive_count > negative_count:
                sentiment = "positive"
                priority = "low"
            else:
                sentiment = "neutral"
                priority = "medium"
            return {
                "sentiment": sentiment,
                "suggested_priority": priority,
                "confidence": 0.7
            }
        except Exception as e:
            logger.error(f"Sentiment analysis error: {e}")
            return {
                "sentiment": "neutral",
                "suggested_priority": "medium",
                "confidence": 0.5
            }

ai_service = AIService()