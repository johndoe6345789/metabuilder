'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Container, Typography, Breadcrumbs,
  Link as M3Link, CircularProgress,
  Box, Alert,
} from '@shared/m3';
import AppNavbar from './AppNavbar';
import ObjectTable from './ObjectTable';
import { useObjects } from '@/hooks';
import labels from '@/constants/ui-labels.json';
import routes from '@/constants/routes.json';

/**
 * @brief Authenticated bucket detail content.
 * Hooks run only after AuthGuard confirms auth.
 */
export default function BucketDetailContent() {
  const params = useParams<{ name: string }>();
  const bucket = params.name;
  const [prefix, setPrefix] = useState('');
  const {
    objects, isLoading, error,
    refresh, uploadObject,
    downloadObject, deleteObject,
  } = useObjects(bucket, prefix);

  return (
    <>
      <AppNavbar />
      <Container
        maxWidth="lg"
        style={{ padding: '16px 12px' }}
      >
        <Breadcrumbs
          style={{ marginBottom: 16 }}
        >
          <M3Link
            href={routes.buckets}
            underline="hover"
          >
            {labels.buckets.title}
          </M3Link>
          <Typography color="text.primary">
            {bucket}
          </Typography>
        </Breadcrumbs>
        <Typography
          variant="h5"
          style={{ marginBottom: 24 }}
        >
          {bucket}
        </Typography>
        {error && (
          <Alert
            severity="error"
            style={{ marginBottom: 16 }}
          >
            {error}
          </Alert>
        )}
        {isLoading ? (
          <Box style={{
            textAlign: 'center',
            padding: '48px 0',
          }}>
            <CircularProgress />
          </Box>
        ) : (
          <ObjectTable
            objects={objects}
            bucketName={bucket}
            prefix={prefix}
            onPrefixChange={setPrefix}
            onUpload={uploadObject}
            onDownload={downloadObject}
            onDelete={deleteObject}
            onRefresh={refresh}
          />
        )}
      </Container>
    </>
  );
}
