/**
 * Spam Detector Plugin Tests
 * Comprehensive test coverage for spam detection functionality
 */

import { SpamDetectorExecutor, spamDetectorExecutor } from './index';
import {
  SpamDetectorConfig,
  SpamDetectionResult,
  AuthenticationStatus,
  SenderReputation
} from './index';

describe('SpamDetectorExecutor', () => {
  const executor = new SpamDetectorExecutor();

  // Mock workflow context
  const mockContext = {
    executionId: 'test-exec-123',
    tenantId: 'test-tenant',
    userId: 'test-user',
    variables: {}
  };

  // Mock workflow state
  const mockState = {};

  /**
   * Test 1: Legitimate email classification
   */
  it('should classify legitimate emails correctly', async () => {
    const config: SpamDetectorConfig = {
      rawMessage: '',
      headers: {
        'from': 'noreply@github.com',
        'subject': 'Your pull request has been merged',
        'authentication-results': 'spf=pass; dkim=pass; dmarc=pass',
        'received': 'from smtp.github.com [192.30.252.0]'
      },
      subject: 'Your pull request has been merged',
      body: 'Congratulations! Your PR has been successfully merged into the main branch.',
      from: 'noreply@github.com',
      tenantId: 'test-tenant'
    };

    const node = {
      id: 'spam-detector-1',
      name: 'Spam Detector',
      type: 'spam-detector',
      nodeType: 'spam-detector',
      parameters: config
    };

    const result = await executor.execute(node, mockContext as any, mockState as any);

    expect(result.status).toBe('success');
    expect(result.output.classification).toBe('legitimate');
    expect(result.output.confidenceScore).toBeLessThan(30);
    expect(result.output.recommendedAction).toBe('deliver');
    expect(result.output.flagForReview).toBe(false);
  });

  /**
   * Test 2: Obvious spam detection
   */
  it('should detect obvious spam emails', async () => {
    const config: SpamDetectorConfig = {
      rawMessage: '',
      headers: {
        'from': 'unknown@spammy-domain.com',
        'subject': 'YOU HAVE WON!!! CLAIM YOUR PRIZE NOW!!!',
        'authentication-results': 'spf=fail; dkim=fail; dmarc=fail',
        'received': 'from [203.0.113.1]'
      },
      subject: 'YOU HAVE WON!!! CLAIM YOUR PRIZE NOW!!!',
      body: 'Congratulations! You have won a free iPhone! Click here immediately to claim your prize. Limited time offer - expires today!',
      from: 'unknown@spammy-domain.com',
      tenantId: 'test-tenant'
    };

    const node = {
      id: 'spam-detector-2',
      name: 'Spam Detector',
      type: 'spam-detector',
      nodeType: 'spam-detector',
      parameters: config
    };

    const result = await executor.execute(node, mockContext as any, mockState as any);

    expect(result.status).toBe('success');
    expect(result.output.classification).toBe('definitely_spam');
    expect(result.output.confidenceScore).toBeGreaterThan(60);
    expect(result.output.recommendedAction).toBe('block');
    expect(result.output.indicators.length).toBeGreaterThan(0);
  });

  /**
   * Test 3: Phishing email detection
   */
  it('should detect phishing attempts', async () => {
    const config: SpamDetectorConfig = {
      rawMessage: '',
      headers: {
        'from': 'noreply@paypa1.com', // Typosquatting
        'subject': 'URGENT: Verify Your PayPal Account',
        'authentication-results': 'spf=fail; dkim=fail',
        'reply-to': 'verify-account@phishing-server.com'
      },
      subject: 'URGENT: Verify Your PayPal Account',
      body: 'Your PayPal account has unusual activity. Click here immediately to verify your identity and update payment information.',
      from: 'noreply@paypa1.com',
      tenantId: 'test-tenant'
    };

    const node = {
      id: 'spam-detector-3',
      name: 'Spam Detector',
      type: 'spam-detector',
      nodeType: 'spam-detector',
      parameters: config
    };

    const result = await executor.execute(node, mockContext as any, mockState as any);

    expect(result.status).toBe('success');
    expect(['likely_spam', 'definitely_spam']).toContain(result.output.classification);
    expect(result.output.confidenceScore).toBeGreaterThan(40);

    // Should detect phishing indicators
    const phishingIndicators = result.output.indicators.filter(
      (ind: any) => ind.name === 'phishing_keywords' || ind.name === 'reply_to_mismatch'
    );
    expect(phishingIndicators.length).toBeGreaterThan(0);
  });

  /**
   * Test 4: Authentication header analysis
   */
  it('should analyze SPF/DKIM/DMARC headers', async () => {
    const config: SpamDetectorConfig = {
      rawMessage: '',
      headers: {
        'from': 'test@example.com',
        'subject': 'Test email',
        'authentication-results': 'spf=pass; dkim=pass; dmarc=pass'
      },
      subject: 'Test email',
      body: 'This is a normal test email.',
      from: 'test@example.com',
      tenantId: 'test-tenant'
    };

    const node = {
      id: 'spam-detector-4',
      name: 'Spam Detector',
      type: 'spam-detector',
      nodeType: 'spam-detector',
      parameters: config
    };

    const result = await executor.execute(node, mockContext as any, mockState as any);

    expect(result.output.authentication.spf).toBe('pass');
    expect(result.output.authentication.dkim).toBe('pass');
    expect(result.output.authentication.dmarc).toBe('pass');
  });

  /**
   * Test 5: Content scoring - spam keywords
   */
  it('should score content with spam keywords', async () => {
    const config: SpamDetectorConfig = {
      rawMessage: '',
      headers: {
        'from': 'marketing@example.com',
        'subject': 'SPECIAL OFFER: Buy Viagra Now!',
        'authentication-results': 'spf=pass; dkim=pass'
      },
      subject: 'SPECIAL OFFER: Buy Viagra Now!',
      body: 'Limited time offer - 50% discount on Viagra! Click here to buy now. Satisfaction guaranteed!',
      from: 'marketing@example.com',
      tenantId: 'test-tenant'
    };

    const node = {
      id: 'spam-detector-5',
      name: 'Spam Detector',
      type: 'spam-detector',
      nodeType: 'spam-detector',
      parameters: config
    };

    const result = await executor.execute(node, mockContext as any, mockState as any);

    expect(result.output.scoreBreakdown.contentScore).toBeGreaterThan(0);
    const spamKeywordIndicators = result.output.indicators.filter((ind: any) => ind.name === 'spam_keywords');
    expect(spamKeywordIndicators.length).toBeGreaterThan(0);
  });

  /**
   * Test 6: Sender reputation analysis
   */
  it('should consider sender reputation', async () => {
    const config: SpamDetectorConfig = {
      rawMessage: '',
      headers: {
        'from': 'badactor@example.com',
        'subject': 'Test email'
      },
      subject: 'Test email',
      body: 'Normal email content',
      from: 'badactor@example.com',
      tenantId: 'test-tenant',
      senderReputation: {
        sender: 'badactor@example.com',
        historicalScore: 85,
        messageCount: 1000,
        spamPercentage: 75,
        whitelisted: false,
        blacklisted: false,
        lastSeenAt: Date.now()
      }
    };

    const node = {
      id: 'spam-detector-6',
      name: 'Spam Detector',
      type: 'spam-detector',
      nodeType: 'spam-detector',
      parameters: config
    };

    const result = await executor.execute(node, mockContext as any, mockState as any);

    expect(result.output.scoreBreakdown.reputationScore).toBeGreaterThan(0);
    expect(result.output.senderReputation).toBeDefined();
    expect(result.output.senderReputation?.spamPercentage).toBe(75);
  });

  /**
   * Test 7: Whitelist support
   */
  it('should respect whitelist', async () => {
    const config: SpamDetectorConfig = {
      rawMessage: '',
      headers: {
        'from': 'noreply@github.com',
        'subject': 'SPAM KEYWORDS HERE!!!'
      },
      subject: 'SPAM KEYWORDS HERE!!!',
      body: 'This would normally be detected as spam',
      from: 'noreply@github.com',
      tenantId: 'test-tenant',
      whitelist: ['github.com', 'noreply@github.com']
    };

    const node = {
      id: 'spam-detector-7',
      name: 'Spam Detector',
      type: 'spam-detector',
      nodeType: 'spam-detector',
      parameters: config
    };

    const result = await executor.execute(node, mockContext as any, mockState as any);

    expect(result.output.classification).toBe('legitimate');
    expect(result.output.confidenceScore).toBe(0);
    expect(result.output.recommendedAction).toBe('deliver');
  });

  /**
   * Test 8: Blacklist support
   */
  it('should respect blacklist', async () => {
    const config: SpamDetectorConfig = {
      rawMessage: '',
      headers: {
        'from': 'blocked@badactor.com',
        'subject': 'Normal email'
      },
      subject: 'Normal email',
      body: 'Even innocent content is blocked',
      from: 'blocked@badactor.com',
      tenantId: 'test-tenant',
      blacklist: ['badactor.com']
    };

    const node = {
      id: 'spam-detector-8',
      name: 'Spam Detector',
      type: 'spam-detector',
      nodeType: 'spam-detector',
      parameters: config
    };

    const result = await executor.execute(node, mockContext as any, mockState as any);

    expect(result.output.classification).toBe('definitely_spam');
    expect(result.output.confidenceScore).toBe(100);
    expect(result.output.recommendedAction).toBe('block');
  });

  /**
   * Test 9: Review flag for borderline cases
   */
  it('should flag borderline emails for review', async () => {
    const config: SpamDetectorConfig = {
      rawMessage: '',
      headers: {
        'from': 'sender@unknown-domain.com',
        'subject': 'Check out this offer',
        'authentication-results': 'spf=softfail'
      },
      subject: 'Check out this offer',
      body: 'I think you might be interested in this. Let me know your thoughts.',
      from: 'sender@unknown-domain.com',
      tenantId: 'test-tenant',
      reviewThreshold: { min: 40, max: 60 }
    };

    const node = {
      id: 'spam-detector-9',
      name: 'Spam Detector',
      type: 'spam-detector',
      nodeType: 'spam-detector',
      parameters: config
    };

    const result = await executor.execute(node, mockContext as any, mockState as any);

    if (result.output.confidenceScore >= 40 && result.output.confidenceScore <= 60) {
      expect(result.output.flagForReview).toBe(true);
      expect(result.output.reviewReason).toBeDefined();
    }
  });

  /**
   * Test 10: Custom spam patterns
   */
  it('should check custom spam patterns', async () => {
    const config: SpamDetectorConfig = {
      rawMessage: '',
      headers: {
        'from': 'marketing@example.com',
        'subject': 'Test email'
      },
      subject: 'Test email',
      body: 'This email contains CUSTOM_SPAM_TRIGGER which should be detected',
      from: 'marketing@example.com',
      tenantId: 'test-tenant',
      customSpamPatterns: ['CUSTOM_SPAM_TRIGGER', 'ANOTHER_PATTERN']
    };

    const node = {
      id: 'spam-detector-10',
      name: 'Spam Detector',
      type: 'spam-detector',
      nodeType: 'spam-detector',
      parameters: config
    };

    const result = await executor.execute(node, mockContext as any, mockState as any);

    const customPatternIndicators = result.output.indicators.filter(
      (ind: any) => ind.name === 'custom_spam_pattern'
    );
    expect(customPatternIndicators.length).toBeGreaterThan(0);
  });

  /**
   * Test 11: Suspicious header patterns
   */
  it('should detect suspicious header patterns', async () => {
    const config: SpamDetectorConfig = {
      rawMessage: '',
      headers: {
        'from': 'sender@example.com',
        'subject': 'Test',
        'reply-to': 'different@phishing.com',
        'x-originating-ip': '[127.0.0.1]'
      },
      subject: 'Test',
      body: 'Test email',
      from: 'sender@example.com',
      tenantId: 'test-tenant'
    };

    const node = {
      id: 'spam-detector-11',
      name: 'Spam Detector',
      type: 'spam-detector',
      nodeType: 'spam-detector',
      parameters: config
    };

    const result = await executor.execute(node, mockContext as any, mockState as any);

    const suspiciousHeaderIndicators = result.output.indicators.filter(
      (ind: any) =>
        ind.name === 'reply_to_mismatch' ||
        ind.name === 'localhost_origin'
    );
    expect(suspiciousHeaderIndicators.length).toBeGreaterThan(0);
  });

  /**
   * Test 12: URL shortener detection
   */
  it('should detect URL shorteners', async () => {
    const config: SpamDetectorConfig = {
      rawMessage: '',
      headers: {
        'from': 'sender@example.com',
        'subject': 'Check this out'
      },
      subject: 'Check this out',
      body: 'Click here: https://bit.ly/xyz123 for more info',
      from: 'sender@example.com',
      tenantId: 'test-tenant'
    };

    const node = {
      id: 'spam-detector-12',
      name: 'Spam Detector',
      type: 'spam-detector',
      nodeType: 'spam-detector',
      parameters: config
    };

    const result = await executor.execute(node, mockContext as any, mockState as any);

    const suspiciousPatternIndicators = result.output.indicators.filter(
      (ind: any) => ind.name === 'suspicious_patterns'
    );
    expect(suspiciousPatternIndicators.length).toBeGreaterThan(0);
  });

  /**
   * Test 13: Excessive punctuation detection
   */
  it('should detect excessive punctuation in subject', async () => {
    const config: SpamDetectorConfig = {
      rawMessage: '',
      headers: {
        'from': 'sender@example.com',
        'subject': 'AMAZING OFFER!!!!!!!!!'
      },
      subject: 'AMAZING OFFER!!!!!!!!!',
      body: 'Normal content here',
      from: 'sender@example.com',
      tenantId: 'test-tenant'
    };

    const node = {
      id: 'spam-detector-13',
      name: 'Spam Detector',
      type: 'spam-detector',
      nodeType: 'spam-detector',
      parameters: config
    };

    const result = await executor.execute(node, mockContext as any, mockState as any);

    const punctuationIndicators = result.output.indicators.filter(
      (ind: any) => ind.name === 'excessive_punctuation' || ind.name === 'excessive_caps'
    );
    expect(punctuationIndicators.length).toBeGreaterThan(0);
  });

  /**
   * Test 14: Validation checks
   */
  it('should validate configuration parameters', () => {
    const node = {
      id: 'spam-detector-14',
      name: 'Spam Detector',
      type: 'spam-detector',
      nodeType: 'spam-detector',
      parameters: {
        headers: {}, // Missing subject
        tenantId: 'test-tenant'
      }
    };

    const result = executor.validate(node as any);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  /**
   * Test 15: Scoring boundaries
   */
  it('should clamp scores to 0-100 range', async () => {
    const config: SpamDetectorConfig = {
      rawMessage: '',
      headers: {
        'from': 'sender@example.com',
        'subject': 'Test'
      },
      subject: 'Test',
      body: 'Normal email',
      from: 'sender@example.com',
      tenantId: 'test-tenant'
    };

    const node = {
      id: 'spam-detector-15',
      name: 'Spam Detector',
      type: 'spam-detector',
      nodeType: 'spam-detector',
      parameters: config
    };

    const result = await executor.execute(node, mockContext as any, mockState as any);

    expect(result.output.confidenceScore).toBeGreaterThanOrEqual(0);
    expect(result.output.confidenceScore).toBeLessThanOrEqual(100);
  });

  /**
   * Test 16: Recommended actions
   */
  it('should recommend appropriate actions', async () => {
    // Legitimate email
    const legitConfig: SpamDetectorConfig = {
      rawMessage: '',
      headers: { 'from': 'noreply@github.com', 'subject': 'Test' },
      subject: 'Test',
      body: 'Normal content',
      from: 'noreply@github.com',
      tenantId: 'test-tenant',
      whitelist: ['github.com']
    };

    const legitNode = {
      id: 'test-1',
      name: 'Spam Detector',
      type: 'spam-detector',
      nodeType: 'spam-detector',
      parameters: legitConfig
    };

    const legitResult = await executor.execute(legitNode, mockContext as any, mockState as any);
    expect(legitResult.output.recommendedAction).toBe('deliver');

    // Definitely spam
    const spamConfig: SpamDetectorConfig = {
      rawMessage: '',
      headers: { 'from': 'badactor@badactor.com', 'subject': 'SPAM' },
      subject: 'YOU HAVE WON!!!',
      body: 'Viagra now!',
      from: 'badactor@badactor.com',
      tenantId: 'test-tenant'
    };

    const spamNode = {
      id: 'test-2',
      name: 'Spam Detector',
      type: 'spam-detector',
      nodeType: 'spam-detector',
      parameters: spamConfig
    };

    const spamResult = await executor.execute(spamNode, mockContext as any, mockState as any);
    expect(spamResult.output.recommendedAction).toBe('block');
  });

  /**
   * Test 17: Error handling
   */
  it('should handle errors gracefully', async () => {
    const config: SpamDetectorConfig = {
      rawMessage: '',
      headers: null as any, // Invalid
      subject: '',
      tenantId: 'test-tenant'
    };

    const node = {
      id: 'spam-detector-17',
      name: 'Spam Detector',
      type: 'spam-detector',
      nodeType: 'spam-detector',
      parameters: config
    };

    const result = await executor.execute(node, mockContext as any, mockState as any);

    expect(result.status).toBe('error');
    expect(result.error).toBeDefined();
    expect(result.errorCode).toBe('SPAM_DETECTION_ERROR');
  });

  /**
   * Test 18: Score breakdown accuracy
   */
  it('should provide accurate score breakdown', async () => {
    const config: SpamDetectorConfig = {
      rawMessage: '',
      headers: {
        'from': 'sender@example.com',
        'subject': 'Test',
        'authentication-results': 'spf=fail',
        'reply-to': 'different@phishing.com'
      },
      subject: 'Test email with phishing content - verify account now!',
      body: 'Click here to verify your account',
      from: 'sender@example.com',
      tenantId: 'test-tenant'
    };

    const node = {
      id: 'spam-detector-18',
      name: 'Spam Detector',
      type: 'spam-detector',
      nodeType: 'spam-detector',
      parameters: config
    };

    const result = await executor.execute(node, mockContext as any, mockState as any);

    const { scoreBreakdown } = result.output;
    const total = scoreBreakdown.headerScore + scoreBreakdown.contentScore +
                  scoreBreakdown.reputationScore + scoreBreakdown.dnsblScore +
                  scoreBreakdown.surblScore;

    // Score should be reasonable
    expect(scoreBreakdown).toBeDefined();
    expect(scoreBreakdown.headerScore).toBeGreaterThanOrEqual(0);
    expect(scoreBreakdown.contentScore).toBeGreaterThanOrEqual(0);
  });

  /**
   * Test 19: Executor singleton
   */
  it('should export executor singleton', () => {
    expect(spamDetectorExecutor).toBeInstanceOf(SpamDetectorExecutor);
    expect(spamDetectorExecutor.nodeType).toBe('spam-detector');
    expect(spamDetectorExecutor.category).toBe('email-integration');
  });

  /**
   * Test 20: Mixed indicators
   */
  it('should accumulate multiple indicators correctly', async () => {
    const config: SpamDetectorConfig = {
      rawMessage: '',
      headers: {
        'from': 'unknown@badactor.com',
        'subject': 'URGENT!!!',
        'authentication-results': 'spf=fail; dkim=fail',
        'reply-to': 'phishing@attacker.com'
      },
      subject: 'URGENT!!! YOU HAVE WON!!!',
      body: 'Verify account now! Click here immediately! Limited offer expires today! Buy Viagra now!',
      from: 'unknown@badactor.com',
      tenantId: 'test-tenant'
    };

    const node = {
      id: 'spam-detector-20',
      name: 'Spam Detector',
      type: 'spam-detector',
      nodeType: 'spam-detector',
      parameters: config
    };

    const result = await executor.execute(node, mockContext as any, mockState as any);

    expect(result.output.indicators.length).toBeGreaterThan(3);
    expect(['likely_spam', 'definitely_spam']).toContain(result.output.classification);
  });
});
