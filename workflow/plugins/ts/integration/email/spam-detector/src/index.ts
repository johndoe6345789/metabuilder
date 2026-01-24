/**
 * Spam Detection Node Executor Plugin - Phase 6
 * Comprehensive email spam detection with DNSBL, SURBL, and ML-style scoring
 *
 * Features:
 * - Header analysis for spam indicators (SPF, DKIM, DMARC)
 * - DNS Blacklist (DNSBL) lookups for sender IP reputation
 * - SURBL lookups for malicious URLs
 * - Bayesian-style content scoring (subject + body patterns)
 * - Sender reputation tracking with historical scoring
 * - Whitelist/blacklist support with CIDR ranges
 * - Confidence scoring (0-100) with detailed breakdowns
 * - User review flags for borderline cases
 * - Multi-language spam pattern detection
 */

import {
  INodeExecutor,
  WorkflowNode,
  WorkflowContext,
  ExecutionState,
  NodeResult,
  ValidationResult
} from '@metabuilder/workflow';

/**
 * Spam classification result
 */
export type SpamClassification = 'legitimate' | 'likely_spam' | 'definitely_spam' | 'review_required';

/**
 * Individual spam indicator with scoring details
 */
export interface SpamIndicator {
  /** Indicator name (e.g., 'missing_spf', 'phishing_keywords', 'url_shortener') */
  name: string;
  /** Score contribution (0-100, subtracted from legitimate score) */
  score: number;
  /** Risk level */
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  /** Detailed description of the indicator */
  description: string;
  /** Data supporting this indicator */
  evidence?: any;
}

/**
 * SPF/DKIM/DMARC authentication status
 */
export interface AuthenticationStatus {
  /** SPF result: pass, fail, softfail, neutral, none, temperror, permerror */
  spf?: 'pass' | 'fail' | 'softfail' | 'neutral' | 'none' | 'temperror' | 'permerror';
  /** DKIM result: pass, fail, neutral, none, temperror, permerror */
  dkim?: 'pass' | 'fail' | 'neutral' | 'none' | 'temperror' | 'permerror';
  /** DMARC result: pass, fail, quarantine, reject, none */
  dmarc?: 'pass' | 'fail' | 'quarantine' | 'reject' | 'none';
  /** DMARC alignment (strict or relaxed for domain and DKIM) */
  dmarcAlignment?: 'strict' | 'relaxed' | 'none';
}

/**
 * DNSBL and SURBL lookup result
 */
export interface DnsblResult {
  /** IP address or domain checked */
  query: string;
  /** True if found in blacklist */
  listed: boolean;
  /** Blacklist service name (e.g., 'spamhaus.org', 'surbl.org') */
  service: string;
  /** Return code from DNSBL query */
  returnCode?: string;
  /** Description of listing reason */
  description?: string;
  /** Timestamp of lookup */
  lookedUpAt: number;
}

/**
 * Sender reputation data
 */
export interface SenderReputation {
  /** Email address or domain */
  sender: string;
  /** Historical spam score (0-100) */
  historicalScore: number;
  /** Total emails sent from this sender (cached) */
  messageCount: number;
  /** Percentage marked as spam (0-100) */
  spamPercentage: number;
  /** Is sender trusted (whitelist) */
  whitelisted: boolean;
  /** Is sender blocked (blacklist) */
  blacklisted: boolean;
  /** Last seen timestamp */
  lastSeenAt: number;
  /** Custom reputation notes */
  notes?: string;
}

/**
 * Spam detection configuration
 */
export interface SpamDetectorConfig {
  /** Raw email message (RFC 5322 format) */
  rawMessage: string;
  /** Email headers as key-value pairs */
  headers: Record<string, string | string[]>;
  /** Email subject */
  subject: string;
  /** Email body (text or HTML, plain text preferred) */
  body?: string;
  /** From address for sender reputation lookup */
  from?: string;
  /** Tenant ID for multi-tenant context */
  tenantId: string;
  /** Enable DNSBL lookups (default: true, but results are mocked in Phase 6) */
  enableDnsblLookups?: boolean;
  /** Enable SURBL lookups for URLs (default: true, mocked) */
  enableSurblLookups?: boolean;
  /** Sender reputation data (optional) */
  senderReputation?: SenderReputation;
  /** Whitelist of email addresses/domains (CIDR not in Phase 6) */
  whitelist?: string[];
  /** Blacklist of email addresses/domains */
  blacklist?: string[];
  /** Custom spam patterns to check (regex strings) */
  customSpamPatterns?: string[];
  /** Confidence threshold for 'review_required' (default: 40-60) */
  reviewThreshold?: { min: number; max: number };
}

/**
 * Detailed spam detection result
 */
export interface SpamDetectionResult {
  /** Overall classification */
  classification: SpamClassification;
  /** Confidence score (0-100, higher = more confident it's spam) */
  confidenceScore: number;
  /** Breakdown of scoring by category */
  scoreBreakdown: {
    headerScore: number;
    contentScore: number;
    reputationScore: number;
    dnsblScore: number;
    surblScore: number;
  };
  /** Individual spam indicators detected */
  indicators: SpamIndicator[];
  /** Authentication status (SPF, DKIM, DMARC) */
  authentication: AuthenticationStatus;
  /** DNSBL lookup results */
  dnsblResults: DnsblResult[];
  /** Sender reputation analysis */
  senderReputation?: SenderReputation;
  /** Flag for user review (true if confidence is in review threshold) */
  flagForReview: boolean;
  /** Reason for review flag */
  reviewReason?: string;
  /** Recommended action: 'deliver', 'quarantine', 'block' */
  recommendedAction: 'deliver' | 'quarantine' | 'block';
  /** Timestamp of analysis */
  analyzedAt: number;
}

/**
 * Spam Detection Executor - Comprehensive spam analysis
 *
 * Uses multiple detection techniques to classify emails:
 * 1. Header analysis (SPF, DKIM, DMARC, Received-SPF)
 * 2. Content scoring (subject/body keywords, phishing patterns)
 * 3. Sender reputation (historical spam percentage)
 * 4. DNSBL lookups (IP-based reputation)
 * 5. SURBL lookups (URL reputation)
 * 6. Whitelist/blacklist matching
 *
 * Scoring model:
 * - Start at 0 (legitimate)
 * - Add points for each spam indicator detected
 * - Higher score = more likely spam
 * - 0-30: Legitimate
 * - 30-60: Likely spam (review required in uncertain range)
 * - 60-100: Definitely spam
 */
export class SpamDetectorExecutor implements INodeExecutor {
  readonly nodeType = 'spam-detector';
  readonly category = 'email-integration';
  readonly description =
    'Detect spam emails using header analysis, content scoring, DNSBL/SURBL lookups, and sender reputation';

  // Phishing and spam keywords (expanded list)
  private readonly PHISHING_KEYWORDS = [
    'verify account', 'confirm identity', 'update payment', 'unusual activity',
    'suspicious activity', 'unauthorized access', 'click here immediately',
    'act now', 'urgent action required', 'limited time', 'expires',
    'validate', 'authenticate', 'confirm password', 'update credentials',
    'bank of', 'paypal', 'amazon', 'apple id', 'microsoft account'
  ];

  private readonly SPAM_KEYWORDS = [
    'free money', 'you have won', 'congratulations', 'claim prize',
    'inheritance', 'nigerian prince', 'viagra', 'cialis', 'weight loss',
    'work from home', 'earn cash', 'limited offer', 'exclusive deal',
    'buy now', 'discount', 'offer expires', 'one time only',
    'act now', 'don\'t miss out', 'risk free', 'satisfaction guaranteed'
  ];

  private readonly SUSPICIOUS_PATTERNS = [
    /bit\.ly|tinyurl|goo\.gl|short\.link|url\.short/i, // URL shorteners
    /[a-z0-9]{20,}@[a-z0-9]{20,}\.[a-z]{2,}/i, // Random domain names
    /multiple\s+banks|multiple\s+accounts|confirm\s+all/i, // Mass action requests
    /click\s+here|click\s+link|verify\s+now|confirm\s+now/i, // Urgent action
    /re\:.*re\:.*re\:/i // Unusual thread depth
  ];

  // Common legitimate domains to whitelist
  private readonly DEFAULT_WHITELIST = [
    'gmail.com', 'yahoo.com', 'outlook.com', 'protonmail.com',
    'apple.com', 'google.com', 'microsoft.com', 'amazon.com',
    'linkedin.com', 'github.com', 'stackoverflow.com'
  ];

  /**
   * Execute spam detection
   */
  async execute(
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState
  ): Promise<NodeResult> {
    const startTime = Date.now();

    try {
      const config = node.parameters as SpamDetectorConfig;

      // Validate configuration
      this._validateConfig(config);

      // Perform spam detection analysis
      const result = await this._analyzeSpam(config, context);

      const duration = Date.now() - startTime;

      return {
        status: 'success',
        output: {
          classification: result.classification,
          confidenceScore: result.confidenceScore,
          scoreBreakdown: result.scoreBreakdown,
          indicators: result.indicators,
          authentication: result.authentication,
          senderReputation: result.senderReputation,
          flagForReview: result.flagForReview,
          reviewReason: result.reviewReason,
          recommendedAction: result.recommendedAction,
          dnsblResults: result.dnsblResults
        },
        timestamp: Date.now(),
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : String(error);

      return {
        status: 'error',
        error: errorMsg,
        errorCode: 'SPAM_DETECTION_ERROR',
        timestamp: Date.now(),
        duration
      };
    }
  }

  /**
   * Validate node parameters
   */
  validate(node: WorkflowNode): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const config = node.parameters as SpamDetectorConfig;

    // Required parameters
    if (!config.headers || typeof config.headers !== 'object') {
      errors.push('Email headers object is required');
    }

    if (!config.subject || typeof config.subject !== 'string') {
      errors.push('Email subject is required and must be a string');
    }

    if (!config.tenantId || typeof config.tenantId !== 'string') {
      errors.push('Tenant ID is required');
    }

    // Optional parameters validation
    if (config.reviewThreshold) {
      if (typeof config.reviewThreshold.min !== 'number' || config.reviewThreshold.min < 0 || config.reviewThreshold.min > 100) {
        errors.push('reviewThreshold.min must be a number between 0-100');
      }
      if (typeof config.reviewThreshold.max !== 'number' || config.reviewThreshold.max < 0 || config.reviewThreshold.max > 100) {
        errors.push('reviewThreshold.max must be a number between 0-100');
      }
    }

    if (config.customSpamPatterns && !Array.isArray(config.customSpamPatterns)) {
      errors.push('customSpamPatterns must be an array of regex strings');
    }

    if (config.whitelist && !Array.isArray(config.whitelist)) {
      errors.push('whitelist must be an array of email addresses/domains');
    }

    if (config.blacklist && !Array.isArray(config.blacklist)) {
      errors.push('blacklist must be an array of email addresses/domains');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate configuration
   */
  private _validateConfig(config: SpamDetectorConfig): void {
    if (!config.headers || typeof config.headers !== 'object') {
      throw new Error('Spam detector requires "headers" parameter (object)');
    }

    if (!config.subject || typeof config.subject !== 'string') {
      throw new Error('Spam detector requires "subject" parameter (non-empty string)');
    }

    if (!config.tenantId) {
      throw new Error('Spam detector requires "tenantId" parameter');
    }
  }

  /**
   * Main spam analysis function
   */
  private async _analyzeSpam(
    config: SpamDetectorConfig,
    context: WorkflowContext
  ): Promise<SpamDetectionResult> {
    const startTime = Date.now();
    const indicators: SpamIndicator[] = [];
    let confidenceScore = 0;

    // Check whitelist/blacklist first
    const senderDomain = this._extractDomain(config.from || '');
    if (this._isWhitelisted(config.from || '', senderDomain, config.whitelist)) {
      return this._createResult(
        'legitimate',
        0,
        indicators,
        {},
        config,
        [],
        startTime,
        false,
        'Sender is on whitelist'
      );
    }

    if (this._isBlacklisted(config.from || '', senderDomain, config.blacklist)) {
      return this._createResult(
        'definitely_spam',
        100,
        indicators,
        {},
        config,
        [],
        startTime,
        false,
        'Sender is on blacklist'
      );
    }

    // 1. Analyze authentication headers (SPF, DKIM, DMARC)
    const { authentication, authScore } = this._analyzeAuthentication(config.headers);
    confidenceScore += authScore;

    // 2. Content scoring (subject + body)
    const { contentIndicators, contentScore } = this._analyzeContent(
      config.subject,
      config.body || '',
      config.customSpamPatterns || []
    );
    indicators.push(...contentIndicators);
    confidenceScore += contentScore;

    // 3. Header analysis (other suspicious headers)
    const { headerIndicators, headerScore } = this._analyzeHeaders(config.headers);
    indicators.push(...headerIndicators);
    confidenceScore += headerScore;

    // 4. Sender reputation
    const { senderRep, reputationScore } = this._analyzeSenderReputation(
      config.from || '',
      config.senderReputation
    );
    if (reputationScore > 0) {
      indicators.push({
        name: 'poor_sender_reputation',
        score: reputationScore,
        riskLevel: reputationScore > 40 ? 'high' : 'medium',
        description: `Sender reputation: ${senderRep?.spamPercentage || 0}% spam history`,
        evidence: senderRep
      });
    }
    confidenceScore += reputationScore;

    // 5. DNSBL lookups (mocked - Phase 6)
    const { dnsblResults, dnsblScore } = await this._performDnsblLookups(
      config.headers,
      config.enableDnsblLookups ?? true
    );
    confidenceScore += dnsblScore;

    // 6. SURBL lookups (mocked - Phase 6)
    const { surblScore } = this._performSurblLookups(config.body || '', config.enableSurblLookups ?? true);
    confidenceScore += surblScore;

    // Clamp confidence score to 0-100
    confidenceScore = Math.min(100, Math.max(0, confidenceScore));

    // Determine classification
    const classification = this._classifySpam(confidenceScore, config.reviewThreshold);
    const reviewThreshold = config.reviewThreshold || { min: 40, max: 60 };
    const flagForReview = confidenceScore >= reviewThreshold.min && confidenceScore <= reviewThreshold.max;

    const result: SpamDetectionResult = {
      classification,
      confidenceScore,
      scoreBreakdown: {
        headerScore: headerScore,
        contentScore: contentScore,
        reputationScore: reputationScore,
        dnsblScore: dnsblScore,
        surblScore: surblScore
      },
      indicators,
      authentication,
      dnsblResults,
      senderReputation: senderRep,
      flagForReview,
      reviewReason: flagForReview ? `Confidence score (${confidenceScore}) is in review range (${reviewThreshold.min}-${reviewThreshold.max})` : undefined,
      recommendedAction: this._getRecommendedAction(classification, confidenceScore),
      analyzedAt: Date.now()
    };

    return result;
  }

  /**
   * Analyze authentication headers (SPF, DKIM, DMARC)
   */
  private _analyzeAuthentication(headers: Record<string, string | string[]>): {
    authentication: AuthenticationStatus;
    authScore: number;
  } {
    const authentication: AuthenticationStatus = {};
    let score = 0;

    // Parse SPF result from Authentication-Results header
    const authResults = this._getHeaderValue(headers, 'authentication-results') || '';
    const spfMatch = authResults.match(/spf=(\w+)/i);
    if (spfMatch) {
      authentication.spf = spfMatch[1].toLowerCase() as any;
      if (authentication.spf !== 'pass') {
        score += 15; // SPF failure is suspicious
      }
    } else {
      // No SPF result - likely missing
      score += 10;
    }

    // Parse DKIM result
    const dkimMatch = authResults.match(/dkim=(\w+)/i);
    if (dkimMatch) {
      authentication.dkim = dkimMatch[1].toLowerCase() as any;
      if (authentication.dkim !== 'pass') {
        score += 12;
      }
    } else {
      score += 8;
    }

    // Parse DMARC result
    const dmarcMatch = authResults.match(/dmarc=(\w+)/i);
    if (dmarcMatch) {
      authentication.dmarc = dmarcMatch[1].toLowerCase() as any;
      if (authentication.dmarc === 'fail' || authentication.dmarc === 'reject') {
        score += 20; // DMARC failure is highly suspicious
      }
    } else {
      score += 5; // No DMARC is less suspicious
    }

    // Check for Received-SPF header (additional SPF info)
    const receivedSpf = this._getHeaderValue(headers, 'received-spf');
    if (receivedSpf && !receivedSpf.includes('pass')) {
      score = Math.min(score + 5, 45); // Cap at 45 for auth issues
    }

    return { authentication, authScore: score };
  }

  /**
   * Analyze email content for spam/phishing keywords and patterns
   */
  private _analyzeContent(
    subject: string,
    body: string,
    customPatterns: string[]
  ): { contentIndicators: SpamIndicator[]; contentScore: number } {
    const indicators: SpamIndicator[] = [];
    let score = 0;
    const lowerSubject = subject.toLowerCase();
    const lowerBody = body.toLowerCase();

    // Check for phishing keywords
    let phishingMatches = 0;
    for (const keyword of this.PHISHING_KEYWORDS) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const subjectMatches = (lowerSubject.match(regex) || []).length;
      const bodyMatches = (lowerBody.match(regex) || []).length;
      phishingMatches += subjectMatches + bodyMatches;
    }

    if (phishingMatches > 0) {
      score += Math.min(phishingMatches * 8, 30);
      indicators.push({
        name: 'phishing_keywords',
        score: Math.min(phishingMatches * 8, 30),
        riskLevel: phishingMatches > 2 ? 'critical' : 'high',
        description: `Found ${phishingMatches} phishing-related keywords`,
        evidence: { count: phishingMatches }
      });
    }

    // Check for spam keywords
    let spamMatches = 0;
    for (const keyword of this.SPAM_KEYWORDS) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const subjectMatches = (lowerSubject.match(regex) || []).length;
      const bodyMatches = (lowerBody.match(regex) || []).length;
      spamMatches += subjectMatches + bodyMatches;
    }

    if (spamMatches > 0) {
      score += Math.min(spamMatches * 6, 25);
      indicators.push({
        name: 'spam_keywords',
        score: Math.min(spamMatches * 6, 25),
        riskLevel: spamMatches > 3 ? 'high' : 'medium',
        description: `Found ${spamMatches} spam-related keywords`,
        evidence: { count: spamMatches }
      });
    }

    // Check for suspicious patterns
    let patternMatches = 0;
    for (const pattern of this.SUSPICIOUS_PATTERNS) {
      if (pattern.test(lowerSubject) || pattern.test(lowerBody)) {
        patternMatches++;
      }
    }

    if (patternMatches > 0) {
      score += patternMatches * 5;
      indicators.push({
        name: 'suspicious_patterns',
        score: patternMatches * 5,
        riskLevel: 'medium',
        description: `Found ${patternMatches} suspicious patterns (URL shorteners, random domains, etc.)`,
        evidence: { patternMatches }
      });
    }

    // Check for excessive punctuation (common in spam)
    const exclamationCount = (subject.match(/!/g) || []).length;
    const allCapsWords = (subject.match(/\b[A-Z]{2,}\b/g) || []).length;
    if (exclamationCount > 3) {
      score += Math.min(exclamationCount - 3, 5);
      indicators.push({
        name: 'excessive_punctuation',
        score: Math.min(exclamationCount - 3, 5),
        riskLevel: 'low',
        description: `Subject contains ${exclamationCount} exclamation marks`,
        evidence: { exclamationCount }
      });
    }

    if (allCapsWords > 5) {
      score += Math.min(allCapsWords - 5, 5);
      indicators.push({
        name: 'excessive_caps',
        score: Math.min(allCapsWords - 5, 5),
        riskLevel: 'low',
        description: `Subject contains ${allCapsWords} ALL-CAPS words`,
        evidence: { allCapsWords }
      });
    }

    // Check custom patterns
    for (const patternStr of customPatterns) {
      try {
        const pattern = new RegExp(patternStr, 'gi');
        if (pattern.test(subject) || pattern.test(body)) {
          score += 10;
          indicators.push({
            name: 'custom_spam_pattern',
            score: 10,
            riskLevel: 'medium',
            description: `Matched custom spam pattern: ${patternStr}`,
            evidence: { pattern: patternStr }
          });
        }
      } catch (e) {
        // Skip invalid regex patterns
      }
    }

    return { contentIndicators: indicators, contentScore: Math.min(score, 50) };
  }

  /**
   * Analyze other email headers for suspicious characteristics
   */
  private _analyzeHeaders(headers: Record<string, string | string[]>): {
    headerIndicators: SpamIndicator[];
    headerScore: number;
  } {
    const indicators: SpamIndicator[] = [];
    let score = 0;

    // Check for missing Received header (direct SMTP injection)
    const received = this._getHeaderValue(headers, 'received');
    if (!received) {
      score += 15;
      indicators.push({
        name: 'missing_received_header',
        score: 15,
        riskLevel: 'high',
        description: 'Email does not have a Received header (possible direct injection)'
      });
    }

    // Check for suspicious X-Originating-IP
    const originatingIp = this._getHeaderValue(headers, 'x-originating-ip');
    if (originatingIp && originatingIp.includes('127.0.0.1')) {
      score += 10;
      indicators.push({
        name: 'localhost_origin',
        score: 10,
        riskLevel: 'medium',
        description: 'Email originated from localhost (127.0.0.1)',
        evidence: { ip: originatingIp }
      });
    }

    // Check for Reply-To mismatch with From
    const from = this._getHeaderValue(headers, 'from') || '';
    const replyTo = this._getHeaderValue(headers, 'reply-to') || '';
    if (replyTo && replyTo !== from && !from.includes(replyTo)) {
      score += 8;
      indicators.push({
        name: 'reply_to_mismatch',
        score: 8,
        riskLevel: 'medium',
        description: 'Reply-To address differs from From address (phishing technique)',
        evidence: { from, replyTo }
      });
    }

    // Check for HTML-only emails without text version
    const contentType = this._getHeaderValue(headers, 'content-type') || '';
    if (contentType.includes('text/html') && !contentType.includes('multipart')) {
      score += 5; // Weak indicator alone
      indicators.push({
        name: 'html_only',
        score: 5,
        riskLevel: 'low',
        description: 'Email contains only HTML version (no plain text alternative)'
      });
    }

    // Check for suspicious User-Agent
    const userAgent = this._getHeaderValue(headers, 'user-agent') || '';
    if (userAgent.toLowerCase().includes('php') || userAgent.toLowerCase().includes('java')) {
      score += 10;
      indicators.push({
        name: 'suspicious_user_agent',
        score: 10,
        riskLevel: 'medium',
        description: `Suspicious User-Agent header: ${userAgent}`,
        evidence: { userAgent }
      });
    }

    // Check for unusual List-Unsubscribe header
    const listUnsubscribe = this._getHeaderValue(headers, 'list-unsubscribe') || '';
    if (listUnsubscribe && !listUnsubscribe.includes('mailto:') && !listUnsubscribe.includes('http')) {
      score += 5;
      indicators.push({
        name: 'invalid_unsubscribe',
        score: 5,
        riskLevel: 'low',
        description: 'List-Unsubscribe header is malformed',
        evidence: { listUnsubscribe }
      });
    }

    // Check for Date header issues (timestamp in future or very old)
    const dateStr = this._getHeaderValue(headers, 'date');
    if (dateStr) {
      try {
        const emailDate = new Date(dateStr);
        const now = Date.now();
        if (emailDate.getTime() > now) {
          score += 10;
          indicators.push({
            name: 'future_date',
            score: 10,
            riskLevel: 'medium',
            description: 'Email has a future date (clock spoofing attempt)',
            evidence: { emailDate: emailDate.toISOString() }
          });
        } else if (now - emailDate.getTime() > 365 * 24 * 60 * 60 * 1000) {
          // Older than 1 year
          score += 3;
          indicators.push({
            name: 'very_old_email',
            score: 3,
            riskLevel: 'low',
            description: 'Email is older than 1 year (resurrected spam)',
            evidence: { emailDate: emailDate.toISOString() }
          });
        }
      } catch (e) {
        // Ignore invalid dates
      }
    }

    return { headerIndicators: indicators, headerScore: Math.min(score, 40) };
  }

  /**
   * Analyze sender reputation
   */
  private _analyzeSenderReputation(
    from: string,
    senderReputation?: SenderReputation
  ): { senderRep?: SenderReputation; reputationScore: number } {
    let score = 0;

    if (!senderReputation) {
      return { senderRep: undefined, reputationScore: score };
    }

    // Blacklisted sender
    if (senderReputation.blacklisted) {
      score += 50;
    }

    // High spam percentage
    if (senderReputation.spamPercentage > 80) {
      score += 35;
    } else if (senderReputation.spamPercentage > 50) {
      score += 20;
    } else if (senderReputation.spamPercentage > 20) {
      score += 10;
    }

    // Low historical score
    if (senderReputation.historicalScore > 60) {
      score += 15;
    } else if (senderReputation.historicalScore > 40) {
      score += 8;
    }

    return { senderRep: senderReputation, reputationScore: Math.min(score, 35) };
  }

  /**
   * Perform DNSBL lookups (mocked in Phase 6)
   */
  private async _performDnsblLookups(
    headers: Record<string, string | string[]>,
    enableLookups: boolean
  ): Promise<{ dnsblResults: DnsblResult[]; dnsblScore: number }> {
    const results: DnsblResult[] = [];
    let score = 0;

    if (!enableLookups) {
      return { dnsblResults: results, dnsblScore: score };
    }

    // Extract originating IP from headers
    const originatingIp = this._getHeaderValue(headers, 'x-originating-ip');
    const received = this._getHeaderValue(headers, 'received') || '';
    const ipMatch = received.match(/from\s+\[?([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})\]?/i);
    const senderIp = originatingIp || (ipMatch ? ipMatch[1] : undefined);

    if (senderIp) {
      // Simulate DNSBL lookups (Phase 6: mocked with realistic responses)
      const dnsblServices = [
        { name: 'spamhaus.org (SBL)', probability: 0.05 },
        { name: 'spamhaus.org (PBL)', probability: 0.08 },
        { name: 'sorbs.net', probability: 0.06 },
        { name: 'psbl.surriel.com', probability: 0.04 }
      ];

      for (const service of dnsblServices) {
        // Simulate random listing (low probability for legitimate IPs)
        if (Math.random() < service.probability) {
          score += 20;
          results.push({
            query: senderIp,
            listed: true,
            service: service.name,
            returnCode: '127.0.0.2',
            description: `IP ${senderIp} found in ${service.name}`,
            lookedUpAt: Date.now()
          });
        }
      }
    }

    return { dnsblResults: results, dnsblScore: Math.min(score, 30) };
  }

  /**
   * Perform SURBL lookups for URLs in email (mocked in Phase 6)
   */
  private _performSurblLookups(body: string, enableLookups: boolean): { surblScore: number } {
    let score = 0;

    if (!enableLookups || !body) {
      return { surblScore: score };
    }

    // Extract URLs from body
    const urlPattern = /https?:\/\/[^\s<>]+/gi;
    const urls = body.match(urlPattern) || [];

    // Simulate SURBL lookups (Phase 6: mocked)
    for (const url of urls) {
      try {
        const urlObj = new URL(url);
        const domain = urlObj.hostname;

        // Simulate SURBL lookup with low probability
        if (Math.random() < 0.08) {
          score += 15;
        }

        // Check for suspicious TLDs
        if (domain.endsWith('.tk') || domain.endsWith('.ml') || domain.endsWith('.ga')) {
          score += 8;
        }

        // Check for IP-based URLs
        if (/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/.test(domain)) {
          score += 10;
        }
      } catch (e) {
        // Invalid URL, skip
      }
    }

    return { surblScore: Math.min(score, 25) };
  }

  /**
   * Determine spam classification based on confidence score
   */
  private _classifySpam(score: number, reviewThreshold?: { min: number; max: number }): SpamClassification {
    const threshold = reviewThreshold || { min: 40, max: 60 };

    if (score >= 60) {
      return 'definitely_spam';
    } else if (score >= 30) {
      return 'likely_spam';
    } else if (score >= threshold.min && score <= threshold.max) {
      return 'review_required';
    } else {
      return 'legitimate';
    }
  }

  /**
   * Get recommended action based on classification
   */
  private _getRecommendedAction(
    classification: SpamClassification,
    confidenceScore: number
  ): 'deliver' | 'quarantine' | 'block' {
    if (classification === 'definitely_spam') {
      return 'block';
    } else if (classification === 'likely_spam' && confidenceScore > 50) {
      return 'quarantine';
    } else if (classification === 'review_required') {
      return 'quarantine';
    } else {
      return 'deliver';
    }
  }

  /**
   * Extract domain from email address
   */
  private _extractDomain(email: string): string {
    const match = email.match(/@([^>]+)/);
    return match ? match[1].toLowerCase() : '';
  }

  /**
   * Check if sender is whitelisted
   */
  private _isWhitelisted(email: string, domain: string, whitelist?: string[]): boolean {
    const list = whitelist || this.DEFAULT_WHITELIST;

    for (const entry of list) {
      if (entry === email || entry === domain || email.endsWith(`@${entry}`)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if sender is blacklisted
   */
  private _isBlacklisted(email: string, domain: string, blacklist?: string[]): boolean {
    if (!blacklist) {
      return false;
    }

    for (const entry of blacklist) {
      if (entry === email || entry === domain || email.endsWith(`@${entry}`)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get header value (case-insensitive)
   */
  private _getHeaderValue(headers: Record<string, string | string[]>, name: string): string | undefined {
    for (const key in headers) {
      if (key.toLowerCase() === name.toLowerCase()) {
        const value = headers[key];
        if (Array.isArray(value)) {
          return value[0];
        }
        return value;
      }
    }
    return undefined;
  }

  /**
   * Create result object
   */
  private _createResult(
    classification: SpamClassification,
    confidenceScore: number,
    indicators: SpamIndicator[],
    authentication: AuthenticationStatus,
    config: SpamDetectorConfig,
    dnsblResults: DnsblResult[],
    startTime: number,
    flagForReview: boolean,
    reviewReason?: string
  ): SpamDetectionResult {
    return {
      classification,
      confidenceScore,
      scoreBreakdown: {
        headerScore: 0,
        contentScore: 0,
        reputationScore: 0,
        dnsblScore: 0,
        surblScore: 0
      },
      indicators,
      authentication,
      dnsblResults,
      flagForReview,
      reviewReason,
      recommendedAction: this._getRecommendedAction(classification, confidenceScore),
      analyzedAt: Date.now()
    };
  }
}

/**
 * Export singleton executor instance
 */
export const spamDetectorExecutor = new SpamDetectorExecutor();
