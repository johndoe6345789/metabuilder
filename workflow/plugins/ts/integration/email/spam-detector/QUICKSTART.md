# Spam Detector Plugin - Quick Start Guide

## Installation

The plugin is located at:
```
workflow/plugins/ts/integration/email/spam-detector/
```

It's already integrated and exported from the email plugin index.

## Basic Usage

### 1. Simple Email Check

```json
{
  "id": "spam-check",
  "type": "spam-detector",
  "nodeType": "spam-detector",
  "parameters": {
    "headers": {
      "from": "sender@example.com",
      "subject": "Test Email",
      "authentication-results": "spf=pass; dkim=pass"
    },
    "subject": "Test Email",
    "body": "This is a normal email",
    "tenantId": "my-tenant"
  }
}
```

### 2. With Sender Reputation

```json
{
  "id": "spam-check",
  "type": "spam-detector",
  "parameters": {
    "headers": { /* ... */ },
    "subject": "Email Subject",
    "body": "Email body",
    "from": "sender@example.com",
    "tenantId": "my-tenant",
    "senderReputation": {
      "sender": "sender@example.com",
      "historicalScore": 25,
      "messageCount": 100,
      "spamPercentage": 10,
      "whitelisted": false,
      "blacklisted": false,
      "lastSeenAt": 1706043600000
    }
  }
}
```

### 3. With Custom Rules

```json
{
  "id": "spam-check",
  "type": "spam-detector",
  "parameters": {
    "headers": { /* ... */ },
    "subject": "Subject",
    "body": "Body",
    "tenantId": "my-tenant",
    "whitelist": ["trusted-partner.com"],
    "blacklist": ["known-spammer.com"],
    "customSpamPatterns": ["INTERNAL_ALERT"],
    "reviewThreshold": { "min": 35, "max": 65 }
  }
}
```

## Output Example

```json
{
  "status": "success",
  "output": {
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
        "description": "Found 3 phishing-related keywords"
      }
    ],
    "authentication": {
      "spf": "fail",
      "dkim": "fail"
    },
    "flagForReview": false,
    "recommendedAction": "quarantine"
  }
}
```

## Classifications

| Score | Classification | Action | Meaning |
|-------|---|---|---|
| 0-30 | Legitimate | Deliver | Safe to deliver |
| 30-60 | Likely Spam | Quarantine | Probably spam |
| 40-60 | Review Required | Quarantine | Uncertain, needs review |
| 60-100 | Definitely Spam | Block | Almost certainly spam |

## Common Scenarios

### Legitimate Email from Gmail
```json
{
  "headers": {
    "from": "noreply@gmail.com",
    "authentication-results": "spf=pass; dkim=pass; dmarc=pass"
  },
  "subject": "Your password was changed",
  "body": "Your account password was successfully changed.",
  "tenantId": "my-tenant"
}
```
**Expected**: `legitimate` (0-30 score)

### Phishing Email
```json
{
  "headers": {
    "from": "noreply@paypal-verify.com",
    "authentication-results": "spf=fail; dkim=fail"
  },
  "subject": "URGENT: Verify Your PayPal Account",
  "body": "Click here immediately to verify your identity and update payment information",
  "tenantId": "my-tenant"
}
```
**Expected**: `definitely_spam` (70+ score)

### Marketing Email
```json
{
  "headers": {
    "from": "marketing@unknown-retailer.com",
    "authentication-results": "spf=softfail"
  },
  "subject": "SPECIAL OFFER!!! 50% OFF!!!",
  "body": "Limited time offer - expires today! Buy now!",
  "tenantId": "my-tenant"
}
```
**Expected**: `likely_spam` (45-55 score)

## Integration with Workflows

### Route emails by spam classification

```json
{
  "nodes": [
    {
      "id": "detect-spam",
      "type": "spam-detector",
      "parameters": {
        "headers": "{{ $json.headers }}",
        "subject": "{{ $json.subject }}",
        "body": "{{ $json.body }}",
        "from": "{{ $json.from }}",
        "tenantId": "{{ $context.tenantId }}"
      }
    },
    {
      "id": "route-by-spam",
      "type": "switch",
      "condition": "{{ $state['detect-spam'].recommendedAction }}",
      "cases": [
        {
          "value": "deliver",
          "nextNodeId": "save-to-inbox"
        },
        {
          "value": "quarantine",
          "nextNodeId": "save-to-spam"
        },
        {
          "value": "block",
          "nextNodeId": "block-sender"
        }
      ]
    }
  ]
}
```

### Flag suspicious emails for review

```json
{
  "nodes": [
    {
      "id": "detect-spam",
      "type": "spam-detector",
      "parameters": {
        "headers": "{{ $json.headers }}",
        "subject": "{{ $json.subject }}",
        "body": "{{ $json.body }}",
        "tenantId": "{{ $context.tenantId }}"
      }
    },
    {
      "id": "create-review-task",
      "type": "condition",
      "condition": "{{ $state['detect-spam'].flagForReview }}",
      "then": {
        "id": "notify-security",
        "type": "send-notification",
        "parameters": {
          "message": "Email flagged for security review: {{ $state['detect-spam'].reviewReason }}"
        }
      }
    }
  ]
}
```

## Recommended Actions

Based on the spam detector's `recommendedAction`:

- **deliver**: Send email to inbox
- **quarantine**: Move to spam/quarantine folder
- **block**: Reject email or add to blocklist

## Tuning

### Adjust Review Threshold

Default is 40-60, meaning emails with scores between 40-60 are flagged for review.

```json
{
  "reviewThreshold": {
    "min": 35,
    "max": 70
  }
}
```

Lower values = more emails marked for review
Higher values = stricter automatic decisions

### Add Trusted Senders

```json
{
  "whitelist": [
    "trusted-partner.com",
    "internal-system@company.com"
  ]
}
```

### Block Specific Senders

```json
{
  "blacklist": [
    "spammer@badactor.com",
    "fake-bank.com"
  ]
}
```

### Custom Spam Detection

Add your own patterns:

```json
{
  "customSpamPatterns": [
    "INTERNAL_ALERT",
    "URGENT_ACTION_REQUIRED",
    "[A-Z]{20,}" // Random all-caps strings
  ]
}
```

## Testing

Run tests locally:

```bash
cd workflow/plugins/ts/integration/email/spam-detector
npm install
npm test
```

## Troubleshooting

### Email marked as spam incorrectly?
- Add sender to whitelist
- Review custom patterns
- Adjust review threshold

### Email not detected as spam?
- Check authentication headers
- Add to blacklist if sender is known bad
- Add custom patterns for specific cases

### Performance issues?
- Check email size (limit 5MB recommended)
- Reduce number of custom patterns
- Contact support for caching options

## Next Steps

1. Integrate into your workflow
2. Monitor spam detection accuracy
3. Adjust whitelist/blacklist as needed
4. Fine-tune custom patterns
5. Plan Phase 7 async enhancements

## Documentation

- Full documentation: [README.md](./README.md)
- Technical details: [TECHNICAL_GUIDE.md](./TECHNICAL_GUIDE.md)
- API reference: [JSDoc in index.ts](./src/index.ts)
- Test examples: [index.test.ts](./src/index.test.ts)

## Support

For issues or questions:
1. Check the [README.md](./README.md) FAQ section
2. Review [TECHNICAL_GUIDE.md](./TECHNICAL_GUIDE.md) for details
3. Check test cases for examples
4. Contact MetaBuilder team

## Quick Reference

```typescript
// TypeScript interface
interface SpamDetectorConfig {
  rawMessage: string;
  headers: Record<string, string | string[]>;
  subject: string;
  body?: string;
  from?: string;
  tenantId: string;
  enableDnsblLookups?: boolean;
  enableSurblLookups?: boolean;
  senderReputation?: SenderReputation;
  whitelist?: string[];
  blacklist?: string[];
  customSpamPatterns?: string[];
  reviewThreshold?: { min: number; max: number };
}

interface SpamDetectionResult {
  classification: 'legitimate' | 'likely_spam' | 'definitely_spam' | 'review_required';
  confidenceScore: number; // 0-100
  indicators: SpamIndicator[];
  flagForReview: boolean;
  recommendedAction: 'deliver' | 'quarantine' | 'block';
}
```

## Example Workflow JSON

```json
{
  "version": "2.2.0",
  "name": "Email with Spam Detection",
  "nodes": [
    {
      "id": "parse-email",
      "type": "email-parser",
      "parameters": {
        "rawMessage": "{{ $json.rawMessage }}",
        "tenantId": "{{ $context.tenantId }}"
      }
    },
    {
      "id": "detect-spam",
      "type": "spam-detector",
      "parameters": {
        "headers": "{{ $state['parse-email'].message.headers }}",
        "subject": "{{ $state['parse-email'].message.subject }}",
        "body": "{{ $state['parse-email'].message.textBody }}",
        "from": "{{ $state['parse-email'].message.from }}",
        "tenantId": "{{ $context.tenantId }}"
      }
    },
    {
      "id": "save-email",
      "type": "dbal-write",
      "parameters": {
        "entity": "email_message",
        "action": "create",
        "data": {
          "subject": "{{ $state['parse-email'].message.subject }}",
          "from": "{{ $state['parse-email'].message.from }}",
          "to": "{{ $state['parse-email'].message.to }}",
          "spamScore": "{{ $state['detect-spam'].confidenceScore }}",
          "spamClassification": "{{ $state['detect-spam'].classification }}",
          "recommendedAction": "{{ $state['detect-spam'].recommendedAction }}"
        }
      }
    }
  ]
}
```

Ready to use! Check README.md for advanced features.
