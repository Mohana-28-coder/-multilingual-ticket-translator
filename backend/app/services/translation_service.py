from langdetect import detect, detect_langs
from deep_translator import GoogleTranslator
from typing import Optional, Tuple
import logging

logger = logging.getLogger(__name__)

LANGUAGE_NAMES = {
    'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
    'it': 'Italian', 'pt': 'Portuguese', 'ru': 'Russian',
    'zh-cn': 'Chinese (Simplified)', 'zh-tw': 'Chinese (Traditional)',
    'ja': 'Japanese', 'ko': 'Korean', 'ar': 'Arabic',
    'hi': 'Hindi', 'bn': 'Bengali', 'pa': 'Punjabi',
    'te': 'Telugu', 'mr': 'Marathi', 'ta': 'Tamil',
    'ur': 'Urdu', 'gu': 'Gujarati', 'kn': 'Kannada',
    'ml': 'Malayalam', 'th': 'Thai', 'vi': 'Vietnamese',
    'tr': 'Turkish', 'pl': 'Polish', 'uk': 'Ukrainian',
    'nl': 'Dutch', 'sv': 'Swedish', 'da': 'Danish',
    'no': 'Norwegian', 'fi': 'Finnish', 'el': 'Greek',
    'cs': 'Czech', 'ro': 'Romanian', 'hu': 'Hungarian',
    'id': 'Indonesian', 'ms': 'Malay', 'tl': 'Filipino',
    'he': 'Hebrew', 'fa': 'Persian', 'sw': 'Swahili',
    'af': 'Afrikaans', 'or': 'Odia'
}

# Unicode script ranges for Indian and other languages
UNICODE_SCRIPT_MAP = [
    ('ta', 0x0B80, 0x0BFF),   # Tamil
    ('hi', 0x0900, 0x097F),   # Devanagari - Hindi, Marathi
    ('mr', 0x0900, 0x097F),   # Marathi (same as Hindi script)
    ('ml', 0x0D00, 0x0D7F),   # Malayalam
    ('te', 0x0C00, 0x0C7F),   # Telugu
    ('kn', 0x0C80, 0x0CFF),   # Kannada
    ('bn', 0x0980, 0x09FF),   # Bengali
    ('gu', 0x0A80, 0x0AFF),   # Gujarati
    ('pa', 0x0A00, 0x0A7F),   # Punjabi/Gurmukhi
    ('or', 0x0B00, 0x0B7F),   # Odia
    ('ar', 0x0600, 0x06FF),   # Arabic/Urdu
    ('he', 0x0590, 0x05FF),   # Hebrew
    ('th', 0x0E00, 0x0E7F),   # Thai
    ('ja', 0x3040, 0x309F),   # Japanese Hiragana
    ('ko', 0xAC00, 0xD7AF),   # Korean Hangul
    ('zh-cn', 0x4E00, 0x9FFF), # Chinese CJK
]


def detect_language_by_unicode(text: str):
    """
    Detect language using Unicode script ranges.
    Returns (lang_code, count) or None if not detected.
    """
    script_counts = {}

    for char in text:
        code_point = ord(char)
        for lang_code, start, end in UNICODE_SCRIPT_MAP:
            if start <= code_point <= end:
                script_counts[lang_code] = script_counts.get(lang_code, 0) + 1
                break

    if not script_counts:
        return None, 0

    best_lang = max(script_counts, key=script_counts.get)
    best_count = script_counts[best_lang]

    # Need at least 10% of characters to be in the script
    total_chars = len([c for c in text if not c.isspace()])
    if total_chars > 0 and best_count / total_chars >= 0.1:
        return best_lang, best_count

    return None, 0


class TranslationService:
    def __init__(self):
        self.supported_languages = list(LANGUAGE_NAMES.keys())

    def detect_language(self, text: str) -> Tuple[str, str, float]:
        """
        Detect language using Unicode first, then langdetect fallback.
        Returns: (language_code, language_name, confidence)
        """
        try:
            if not text or len(text.strip()) < 3:
                return 'en', 'English', 0.0

            # Stage 1: Unicode script detection (most accurate for Indian languages)
            unicode_lang, unicode_count = detect_language_by_unicode(text)
            if unicode_lang:
                lang_name = LANGUAGE_NAMES.get(unicode_lang, unicode_lang.upper())
                logger.info(f"Unicode detection: {unicode_lang} ({lang_name})")
                return unicode_lang, lang_name, 0.99

            # Stage 2: langdetect for Latin-script languages
            detected_langs = detect_langs(text)
            if detected_langs:
                top_lang = detected_langs[0]
                lang_code = str(top_lang.lang)
                confidence = top_lang.prob
                lang_name = LANGUAGE_NAMES.get(lang_code, lang_code.upper())
                logger.info(f"langdetect detection: {lang_code} ({lang_name})")
                return lang_code, lang_name, confidence

            return 'en', 'English', 0.0

        except Exception as e:
            logger.error(f"Language detection error: {e}")
            return 'en', 'English', 0.0

    def translate_text(
        self,
        text: str,
        target_language: str = 'en',
        source_language: Optional[str] = None
    ) -> Tuple[str, str]:
        """
        Translate text to target language.
        Returns: (translated_text, source_language)
        """
        try:
            if not text or len(text.strip()) == 0:
                return text, source_language or 'en'

            if not source_language:
                source_language, _, _ = self.detect_language(text)

            if source_language == target_language:
                return text, source_language

            # Handle Chinese variants
            src_lang = 'zh-CN' if source_language in ['zh-cn', 'zh'] else source_language
            tgt_lang = 'zh-CN' if target_language in ['zh-cn', 'zh'] else target_language

            # Split long text into chunks (GoogleTranslator has 5000 char limit)
            if len(text) > 4500:
                chunks = self.split_text(text, 4500)
                translated_chunks = []
                for chunk in chunks:
                    translator = GoogleTranslator(source=src_lang, target=tgt_lang)
                    translated_chunk = translator.translate(chunk)
                    translated_chunks.append(translated_chunk)
                translated = ' '.join(translated_chunks)
            else:
                translator = GoogleTranslator(source=src_lang, target=tgt_lang)
                translated = translator.translate(text)

            return translated, source_language

        except Exception as e:
            logger.error(f"Translation error: {e}")
            return text, source_language or 'en'

    def split_text(self, text: str, chunk_size: int):
        """Split text into chunks of specified size."""
        words = text.split()
        chunks = []
        current_chunk = []
        current_size = 0

        for word in words:
            if current_size + len(word) + 1 > chunk_size:
                chunks.append(' '.join(current_chunk))
                current_chunk = [word]
                current_size = len(word)
            else:
                current_chunk.append(word)
                current_size += len(word) + 1

        if current_chunk:
            chunks.append(' '.join(current_chunk))

        return chunks

    def translate_to_english(
        self,
        text: str,
        source_language: Optional[str] = None
    ) -> Tuple[str, str]:
        """Translate text to English."""
        return self.translate_text(
            text,
            target_language='en',
            source_language=source_language
        )

    def translate_from_english(
        self,
        text: str,
        target_language: str
    ) -> str:
        """Translate English text to target language."""
        translated, _ = self.translate_text(
            text,
            target_language=target_language,
            source_language='en'
        )
        return translated

    def get_language_name(self, lang_code: str) -> str:
        """Get the full name of a language from its code."""
        return LANGUAGE_NAMES.get(lang_code, lang_code.upper())


translation_service = TranslationService()