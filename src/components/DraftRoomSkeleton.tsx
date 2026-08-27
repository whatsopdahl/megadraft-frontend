import React from 'react';
import { Box, Card, CardContent, CardHeader, Skeleton, Stack } from '@mui/material';

/** Mirrors DraftRoom's layout (header, DraftOrder, Roster/PlayerSearch/DraftLog) while the initial draft state loads. */
const DraftRoomSkeleton: React.FC = () => (
  <>
    <Skeleton variant="text" width={140} height={40} sx={{ mb: 2 }} />

    <Card sx={{ mb: 2 }}>
      <CardHeader title={<Skeleton variant="text" width={220} />} subheader={<Skeleton variant="text" width={100} />} />
    </Card>

    <Card sx={{ p: 2, mb: 2 }}>
      <Skeleton variant="text" width={90} sx={{ mb: 1 }} />
      <Stack direction="row" spacing={1.5} sx={{ overflowX: 'hidden' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" width={130} height={80} sx={{ flex: '0 0 auto' }} />
        ))}
      </Stack>
    </Card>

    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr 1fr' }, gap: 2 }}>
      <Card>
        <CardHeader title={<Skeleton variant="text" width={100} />} />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Array.from({ length: 2 }).map((_, i) => (
            <Box key={i} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
              <Skeleton variant="text" width={50} sx={{ mb: 0.5 }} />
              <Stack spacing={0.75}>
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} variant="text" />
                ))}
              </Stack>
            </Box>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title={<Skeleton variant="text" width={140} />} />
        <CardContent>
          <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
            <Skeleton variant="rounded" width={100} height={32} />
            <Skeleton variant="rounded" height={32} sx={{ flexGrow: 1 }} />
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" width={48} height={24} />
            ))}
          </Stack>
          <Stack spacing={1}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Stack key={i} direction="row" spacing={1.5} sx={{ alignItems: 'center', p: 1 }}>
                <Skeleton variant="circular" width={32} height={32} />
                <Skeleton variant="text" width={24} />
                <Skeleton variant="text" sx={{ flexGrow: 1 }} />
                <Skeleton variant="text" width={40} />
                <Skeleton variant="rounded" width={32} height={20} />
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title={<Skeleton variant="text" width={120} />} />
        <CardContent>
          <Stack spacing={1.5}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Stack key={i} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Skeleton variant="text" width={20} />
                <Box sx={{ flexGrow: 1 }}>
                  <Skeleton variant="text" width="70%" />
                  <Skeleton variant="text" width="40%" />
                </Box>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  </>
);

export default DraftRoomSkeleton;
