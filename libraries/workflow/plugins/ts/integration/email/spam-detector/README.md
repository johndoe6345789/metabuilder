# Spam Detector Plugin - Phase 6

Comprehensive email spam detection workflow plugin with advanced scoring mechanisms, DNSBL/SURBL lookups, sender reputation analysis, and user review flags for borderline cases.

## Features

### Detection Techniques

1. **Header Analysis (SPF, DKIM, DMARC)**
   - Validates email authentication headers
   - Scores based on authentication failures
   - Detects spoofing attempts

2. **Content Scoring**
   - Phishing keyword detection (bank verification, urgent action, etc.)
   - Spam keyword detection (prizes, viagra, weight loss, etc.)
   - Suspicious pattern matching (URL shorteners, random domains)
   - Excessive punctuation and CAPS detection
   - Custom regex pattern support

3. **Sender Reputation**
   - Historical spam percentage tracking
   - Sender trust scoring
   - Integration with whitelist/blacklist
   - Long-term reputation analysis

4. **DNSBL Lookups**
   - DNS Blacklist queries (mocked in Phase 6)
   - IP-based sender reputation
   - Multiple DNSBL service support:
     - Spamhaus SBL/PBL
     - SORBS
     - PSBL

5. **SURBL Lookups**
   - Domain-based URL reputation (mocked in Phase 6)
   - Suspicious TLD detection (.tk, .ml, .ga)
   - IP-based URL detection
   - URL shortener identification

6. **Whitelist/Blacklist**
   - Email address matching
   - Domain matching
   - Default whitelist for major providers
   - User-defined lists

7. **Review Flags**
   - Configurable confidence threshold range
   - Automatic flagging for borderline cases
   - Review reason tracking
   - User intervention points

## Scoring Model

```
Score Range    Classification      Recommended Action
0-30           Legitimate          Deliver
30-60          Likely Spam         Quarantine (if high confidence)
40-60          Review Required*    Quarantine + Flag
60-100         Definitely Spam     Block

*Configurable threshold range
```

## Configuration

### Required Parameters

```typescript
interface SpamDetectorConfig {
  // Email data
  rawMessage: string;              // RFC 5322 format (can be empty string)
  headers: Record<string, string | string[]>;  // Email headers
  subject: string;                 // Email subject

  // Context
  tenantId: string;               // Multi-tenant identifier

  // Optional
  body?: string;                  // Email body (plain text preferred)
  from?: string;                  // From address

  // Detection options
  enableDnsblLookups?: boolean;    // Default: true (mocked)
  enableSurblLookups?: boolean;    // Default: true (mocked)

  // Lists
  whitelist?: string[];            // Trusted senders
  blacklist?: string[];            // Blocked senders

  // Custom patterns
  customSpamPatterns?: string[];   // Regex patterns

  // Thresholds
  reviewThreshold?: {
    min: number;    // Default: 40
    max: number;    // Default: 60
  };

  // Reputation
  senderReputation?: SenderReputation;
}
```

### Example Configuration

```json
{
  "headers": {
    "from": "noreply@github.com",
    "subject": "Your PR has been merged",
    "authentication-results": "spf=pass; dkim=pass; dmarc=pass"
  },
  "subject": "Your PR has been merged",
  "body": "Congratulations! Your pull request...",
  "from": "noreply@github.com",
  "tenantId": "acme-corp",
  "whitelist": ["github.com", "gitlab.com"],
  "blacklist": ["spam-domain.com"],
  "customSpamPatterns": ["SPECIAL_PATTERN", "ANOTHER_TRIGGER"],
  "reviewThreshold": { "min": 40, "max": 60 }
}
```

## Output

### SpamDetectionResult

```typescript
interface SpamDetectionResult {
  // Classification
  classification: 'legitimate' | 'likely_spam' | 'definitely_spam' | 'review_required';
  confidenceScore: number;  // 0-100

  // Breakdown
  scoreBreakdown: {
    headerScore: number;
    contentScore: number;
    reputationScore: number;
    dnsblScore: number;
    surblScore: number;
  };

  // Details
  indicators: SpamIndicator[];
  authentication: AuthenticationStatus;
  dnsblResults: DnsblResult[];
  senderReputation?: SenderReputation;

  // User action
  flagForReview: boolean;
  reviewReason?: string;
  recommendedAction: 'deliver' | 'quarantine' | 'block';

  // Metadata
  analyzedAt: number;
}
```

### Example Output

```json
{
  "classification": "likely_spam",
  "confidenceScore": 72,
  "scoreBreakdown": {
    "headerScore": 25,
    "contentScore": 35,
    "reputationScore": 12,
    "dnsblScore": 0,
    "surblScore": 0
  },
  "indicators": [
    {
      "name": "phishing_keywords",
      "score": 24,
      "riskLevel": "critical",
      "description": "Found 3 phishing-related keywords",
      "evidence": { "count": 3 }
    },
    {
      "name": "reply_to_mismatch",
      "score": 8,
      "riskLevel": "medium",
      "description": "Reply-To address differs from From address"
    }
  ],
  "authentication": {
    "spf": "fail",
    "dkim": "fail",
    "dmarc": "fail"
  },
  "flagForReview": false,
  "recommendedAction": "quarantine",
  "analyzedAt": 1706043600000
}
```

## Usage in Workflows

### Basic Email Spam Check

```json
{
  "id": "spam-check",
  "type": "spam-detector",
  "nodeType": "spam-detector",
  "parameters": {
    "headers": "{{ $json.headers }}",
    "subject": "{{ $json.subject }}",
    "body": "{{ $json.body }}",
    "from": "{{ $json.from }}",
    "tenantId": "{{ $context.tenantId }}"
  }
}
```

### With Sender Reputation

```json
{
  "id": "spam-check-advanced",
  "type": "spam-detector",
  "parameters": {
    "headers": "{{ $json.headers }}",
    "subject": "{{ $json.subject }}",
    "body": "{{ $json.body }}",
    "from": "{{ $json.from }}",
    "tenantId": "{{ $context.tenantId }}",
    "senderReputation": {
      "sender": "{{ $json.from }}",
      "historicalScore": 45,
      "messageCount": 250,
      "spamPercentage": 18,
      "whitelisted": false,
      "blacklisted": false,
      "lastSeenAt": 1706043600000
    }
  }
}
```

### With Custom Rules

```json
{
  "id": "spam-check-custom",
  "type": "spam-detector",
  "parameters": {
    "headers": "{{ $json.headers }}",
    "subject": "{{ $json.subject }}",
    "body": "{{ $json.body }}",
    "from": "{{ $json.from }}",
    "tenantId": "{{ $context.tenantId }}",
    "whitelist": ["trusted-partner.com"],
    "blacklist": ["known-spammer.com"],
    "customSpamPatterns": ["INTERNAL_ALERT", "URGENT_ACTION_REQUIRED"],
    "reviewThreshold": { "min": 35, "max": 65 }
  }
}
```

## Score Calculation

### Header Analysis (Max: 45 points)

- Missing SPF: +10
- SPF failure: +15
- Missing DKIM: +8
- DKIM failure: +12
- Missing DMARC: +5
- DMARC failure: +20
- Received-SPF failure: +5

### Content Analysis (Max: 50 points)

- Phishing keywords: +8 per keyword (max 30)
- Spam keywords: +6 per keyword (max 25)
- Suspicious patterns: +5 per pattern
- Excessive punctuation (>3 !): +5
- Excessive CAPS (>5 words): +5
- Custom patterns: +10 per match

### Reputation (Max: 35 points)

- Blacklisted sender: +50 (→ 100 score, classified as definitely_spam)
- High spam % (>80): +35
- Medium spam % (>50): +20
- Low spam % (>20): +10
- Poor historical score (>60): +15
- Medium historical score (>40): +8

### DNSBL (Max: 30 points)

- Per blacklist listing: +20
- Multiple listings: Capped at 30

### SURBL (Max: 25 points)

- Suspicious TLD (.tk, .ml, .ga): +8 per URL
- IP-based URL: +10
- SURBL listed: +15
- Capped at 25 total

## Detection Examples

### Legitimate Email

```
From: noreply@github.com
Subject: Your pull request has been merged
Authentication-Results: spf=pass; dkim=pass; dmarc=pass

Score: 2
Classification: Legitimate
Recommended Action: Deliver
```

### Phishing Email

```
From: noreply@paypal-verify.com
Subject: URGENT: Verify Your PayPal Account
Authentication-Results: spf=fail; dkim=fail

Body: Click here immediately to verify your identity...

Score: 78
Classification: Definitely Spam
Recommended Action: Block
Indicators: phishing_keywords (24), reply_to_mismatch (8), spf_failure (15)
```

### Likely Spam

```
From: marketing@unknowndomain.com
Subject: SPECIAL OFFER!!! Buy Viagra Now!!!
Authentication-Results: spf=softfail

Score: 48
Classification: Review Required
Recommended Action: Quarantine
```

## Phase 6 Limitations

- **DNSBL/SURBL**: Mocked with realistic response patterns (real lookups in Phase 7)
- **ML Scoring**: Simplified Bayesian-style approach (ML model in Phase 8)
- **Rate Limiting**: Not implemented (Phase 8)
- **Caching**: No sender reputation cache (Phase 8)
- **Historical Data**: Uses provided data, not persisted (Phase 8)

## Testing

### Run Tests

```bash
npm test
```

### Test Coverage

```bash
npm run test:coverage
```

### Watch Mode

```bash
npm run test:watch
```

## Tests Included

1. Legitimate email classification
2. Obvious spam detection
3. Phishing attempt detection
4. SPF/DKIM/DMARC header analysis
5. Content scoring with spam keywords
6. Sender reputation analysis
7. Whitelist support
8. Blacklist support
9. Review flag for borderline cases
10. Custom spam pattern detection
11. Suspicious header pattern detection
12. URL shortener detection
13. Excessive punctuation detection
14. Configuration validation
15. Score boundary clamping (0-100)
16. Recommended action accuracy
17. Error handling
18. Score breakdown accuracy
19. Executor singleton export
20. Multiple indicators accumulation

## Integration with DBAL

The spam detection results can be stored in the EmailMessage entity:

```typescript
interface EmailMessage {
  // ... existing fields ...
  spamScore: number;           // 0-100
  spamClassification: string;  // legitimate, likely_spam, definitely_spam
  spamIndicators: SpamIndicator[];
  flaggedForReview: boolean;
  recommendedAction: string;   // deliver, quarantine, block
}
```

## Performance Considerations

- **Content Analysis**: O(n) where n = email size
- **DNSBL Lookups**: Mocked (real = async network calls)
- **Pattern Matching**: O(m) where m = number of patterns
- **Regex Compilation**: Patterns compiled on-the-fly (consider caching)
- **Score Calculation**: O(1) - fixed computation

## Security Notes

- Email headers are not sanitized (trusted from DBAL)
- Custom patterns are validated at runtime
- HTML body should be sanitized before analysis
- URLs extracted from body are not followed
- DNSBL queries are read-only
- No credentials stored locally

## Future Enhancements

1. **Phase 7**: Real DNSBL/SURBL async lookups with caching
2. **Phase 8**: Machine learning scoring, sender reputation persistence
3. **Phase 9**: Image analysis for embedded spam, OCR for obfuscation
4. **Phase 10**: Feedback loop for false positive/negative training

## File Structure

```
spam-detector/
├── package.json                    # Package configuration
├── README.md                       # This file
├── src/
│   ├── index.ts                   # Main implementation (800+ lines)
│   └── index.test.ts              # Comprehensive tests (20 test cases)
└── dist/
    ├── index.js                   # Compiled JavaScript
    └── index.d.ts                 # TypeScript declarations
```

## Version

- **Version**: 1.0.0
- **Status**: Production Ready (Phase 6)
- **Last Updated**: 2026-01-24
- **Maintenance**: Active

## Support

For issues or feature requests, contact the MetaBuilder team or create an issue in the workflow plugins repository.
