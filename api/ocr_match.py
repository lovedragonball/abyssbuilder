from http.server import BaseHTTPRequestHandler
import json
from rapidfuzz import process, fuzz

# Default mod names - can be overridden by client
DEFAULT_MOD_NAMES = [
    "Arbiter's Illusionary Sacrifice",
    "Bahamut's Frosty Torrent",
    "Bahamut's Misty Veil",
    "Cerberus's Celerity",
    "Cerberus's Crusher",
    "Prime • Serenity +5",
    "Skylume • Wildfire +5",
    "Wings • Inspo +5",
    "Spectrum +5",
    "Scorch +5",
    "Vigilant +5",
    "Nirvana • Volition +5",
    "Blaze • Inspo +10",
    "Blaze • Spectrum +10",
    "Steadfast +5",
    "Onslaught +10",
    "Seawave • Midnight Sun",
]

def normalize_text(text):
    """Normalize text for better matching"""
    if not text:
        return ""
    # Convert to lowercase and remove extra spaces
    normalized = text.lower().strip()
    # Replace common OCR confusion characters
    normalized = normalized.replace('·', ' ').replace('•', ' ')
    normalized = ' '.join(normalized.split())
    return normalized

def find_best_match(candidate, known_mods, score_threshold=50):
    """Find the best matching mod name using fuzzy matching"""
    if not candidate or not known_mods:
        return None, 0, None
    
    # Normalize candidate
    normalized_candidate = normalize_text(candidate)
    
    # Skip if normalized candidate is too short
    if len(normalized_candidate) < 3:
        return None, 0, normalized_candidate
    
    # Normalize all known mods for matching
    normalized_mods = [(mod, normalize_text(mod)) for mod in known_mods]
    
    # Use rapidfuzz to find best match
    # extractOne returns (match, score, index)
    result = process.extractOne(
        normalized_candidate,
        [norm for _, norm in normalized_mods],
        scorer=fuzz.WRatio,
        score_cutoff=30  # Minimum score threshold for consideration
    )
    
    if result:
        matched_normalized, score, index = result
        # Return the original mod name (not normalized)
        original_mod = known_mods[index]
        
        # Only return match if score meets threshold
        if score >= score_threshold:
            return original_mod, round(score, 2), normalized_candidate
        else:
            # Score too low, return None but keep the score for debugging
            return None, round(score, 2), normalized_candidate
    
    return None, 0, normalized_candidate

class handler(BaseHTTPRequestHandler):
    def _set_cors_headers(self):
        """Set CORS headers for all responses"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'OPTIONS, POST')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    
    def do_OPTIONS(self):
        """Handle CORS preflight request"""
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()
    
    def do_POST(self):
        """Handle POST request for OCR matching"""
        try:
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            
            # Parse JSON
            try:
                data = json.loads(body.decode('utf-8'))
            except json.JSONDecodeError:
                self.send_response(400)
                self._set_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'error': 'Invalid JSON in request body'
                }).encode('utf-8'))
                return
            
            # Extract candidates and known_mods
            candidates = data.get('candidates', [])
            known_mods = data.get('known_mods', DEFAULT_MOD_NAMES)
            
            # Validate input
            if not isinstance(candidates, list):
                self.send_response(400)
                self._set_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'error': 'candidates must be an array'
                }).encode('utf-8'))
                return
            
            if not isinstance(known_mods, list):
                self.send_response(400)
                self._set_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'error': 'known_mods must be an array'
                }).encode('utf-8'))
                return
            
            # Get score threshold from request (default 50)
            score_threshold = data.get('score_threshold', 50)
            
            # Process each candidate
            results = []
            for candidate in candidates:
                if not candidate or not isinstance(candidate, str):
                    continue
                
                best_match, score, normalized = find_best_match(candidate, known_mods, score_threshold)
                
                results.append({
                    'input': candidate,
                    'normalized': normalized,
                    'bestMatch': best_match,
                    'score': score,
                    'matched': best_match is not None
                })
            
            # Send success response
            self.send_response(200)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            response = {
                'results': results,
                'total_candidates': len(candidates),
                'total_matched': sum(1 for r in results if r['bestMatch'] is not None)
            }
            
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            # Handle unexpected errors
            self.send_response(500)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'error': f'Internal server error: {str(e)}'
            }).encode('utf-8'))
