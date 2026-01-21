'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkle } from '@phosphor-icons/react';
import { DEMO_CODE } from '@/components/demo/demo-constants';
import { DemoFeatureCards } from '@/components/demo/DemoFeatureCards';
import { PageLayout } from '../PageLayout';

export const dynamicParams = true

// Dynamically import SplitScreenEditor to avoid SSR issues with Pyodide
const SplitScreenEditor = dynamic(
  () => import('@/components/features/snippet-editor/SplitScreenEditor').then(mod => ({ default: mod.SplitScreenEditor })),
  { ssr: false }
);

export default function DemoPage() {
  const [code, setCode] = useState(DEMO_CODE);

  return (
    <PageLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
              <Sparkle className="h-5 w-5 text-primary-foreground" weight="fill" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Split-Screen Demo</h2>
          </div>
          <p className="text-muted-foreground">
            Experience live React component editing with real-time preview. Edit the code on the left and watch it update instantly on the right.
          </p>
        </div>

        <Card className="border-accent/20 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkle className="h-5 w-5 text-accent" weight="fill" />
              Interactive Code Editor
            </CardTitle>
            <CardDescription>
              This editor supports JSX, TSX, JavaScript, and TypeScript with live preview. 
              Try switching between Code, Split, and Preview modes using the buttons above the editor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SplitScreenEditor
              value={code}
              onChange={setCode}
              language="JSX"
              height="600px"
            />
          </CardContent>
        </Card>

        <DemoFeatureCards />
      </motion.div>
    </PageLayout>
  );
}
