/**
 * FAQAccordionItem - Single FAQ accordion entry
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@metabuilder/m3';
import { ChevronDownIcon } from '@icons/react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface FAQAccordionItemProps {
  faq: FAQ;
  expanded: boolean;
  onChange: (
    e: React.SyntheticEvent,
    isExpanded: boolean
  ) => void;
}

export default function FAQAccordionItem({
  faq,
  expanded,
  onChange,
}: FAQAccordionItemProps) {
  return (
    <Accordion
      expanded={expanded}
      onChange={onChange}
      data-testid={`faq-${faq.id}`}
    >
      <AccordionSummary
        expandIcon={<ChevronDownIcon />}
        aria-controls={`faq-${faq.id}-content`}
        id={`faq-${faq.id}-header`}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            width: '100%',
          }}
        >
          <Typography variant="subtitle1" sx={{ flex: 1 }}>
            {faq.question}
          </Typography>
          <Chip label={faq.category} size="small" />
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2" color="text.secondary">
          {faq.answer}
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
}
