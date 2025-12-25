import re
from collections import Counter

class GlossaryExtractor:
    def __init__(self, translator, normalizer):
        self.translator = translator
        self.normalizer = normalizer

    def tokenize_ru(self, text: str):
        return re.findall(r"[А-Яа-яЁё]{3,}", text)

    def tokenize_en(self, text: str):
        return re.findall(r"[a-zA-Z]{3,}", text)

    def extract_pairs(self, src_text: str, tgt_text: str):
        src_words = self.tokenize_ru(src_text)
        tgt_words = self.tokenize_en(tgt_text)

        # Normalize Russian
        src_norm = [self.normalizer.normalize(w) for w in src_words]

        src_freq = Counter(src_norm)
        tgt_freq = Counter(w.lower() for w in tgt_words)

        pairs = []

        for ru_word, _ in src_freq.most_common(300):
            translated = self.translator.translate_batch(
                [ru_word], target="en"
            )[0].lower()

            if translated in tgt_freq:
                pairs.append({
                    "src": ru_word,
                    "tgt": translated,
                    "confidence": round(min(1.0, tgt_freq[translated] / 3), 2)
                })

        return pairs
