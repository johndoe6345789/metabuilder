/**
 * HelpFAQSection - FAQ accordion list with category filters
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
} from '@metabuilder/fakemui';
import FAQCategoryFilter from './FAQCategoryFilter';
import FAQAccordionItem from './FAQAccordionItem';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface HelpFAQSectionProps {
  filteredFAQs: FAQ[];
  categories: string[];
  expandedAccordion: string | false;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  handleAccordionChange: (
    panel: string
  ) => (e: React.SyntheticEvent, expanded: boolean) => void;
}

export default function HelpFAQSection({
  filteredFAQs,
  categories,
  expandedAccordion,
  searchQuery,
  setSearchQuery,
  handleAccordionChange,
}: HelpFAQSectionProps) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Frequently Asked Questions
      </Typography>

      <FAQCategoryFilter
        categories={categories}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {filteredFAQs.length === 0 ? (
        <Card>
          <CardContent>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              No results found for &quot;{searchQuery}&quot;.
              Try a different search term.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box data-testid="faq-list">
          {filteredFAQs.map((faq) => (
            <FAQAccordionItem
              key={faq.id}
              faq={faq}
              expanded={expandedAccordion === faq.id}
              onChange={handleAccordionChange(faq.id)}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
