import { Suspense } from 'react';
import { Box, Typography, Paper, Stack } from '@mui/material';
import { getToolList } from '@/features/admin/tools/queries';
import ToolListTable from './components/tool-list-table';
import ToolListFilters from './components/tool-list-filters';
import CreateToolButton from './components/create-tool-button';
import Loading from '@/app/loading';

interface PageProps {
    searchParams: Promise<{
        search?: string;
        status?: 'all' | 'active' | 'inactive';
        page?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }>;
}

import { getLocale, getTranslations } from 'next-intl/server';

export default async function ToolsListPage({ searchParams }: PageProps) {
    const t = await getTranslations('dashboard');
    const locale = await getLocale();
    const params = await searchParams;
    const search = params.search || '';
    const status = params.status || 'all';
    const page = parseInt(params.page || '1', 10);
    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';

    const { data: tools, total, pageSize } = await getToolList({
        search,
        status,
        page,
        sortBy,
        sortOrder,
        locale,
    });

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 3 }}
            >
                <Typography variant="h4" fontWeight="bold">
                    {t('tools-list-title')}
                </Typography>
                <CreateToolButton />
            </Stack>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <ToolListFilters search={search} status={status} />
            </Paper>

            {/* Table */}
            <Paper sx={{ p: 2 }}>
                <ToolListTable
                    tools={tools}
                    total={total}
                    page={page}
                    pageSize={pageSize}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                />
            </Paper>
        </Box>
    );
}
